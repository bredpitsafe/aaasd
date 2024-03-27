import pipe from 'lodash/fp/pipe';
import { isFunction, isUndefined } from 'lodash-es';
import { MonoTypeOperatorFunction, Observable, OperatorFunction } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

import { ModuleFactory, TContextRef } from '../../di';
import { NO_RETRIES } from '../../handlers/def';
import { ModuleActor } from '../../modules/actor';
import { ModuleCommunicationHandlersRemoted } from '../../modules/communicationRemoteHandlers';
import { TSocketURL } from '../../types/domain/sockets';
import { TStructurallyCloneable } from '../../types/serialization';
import { createActorObservableBox } from '../Actors/observable';
import { createActorRequestBox } from '../Actors/request';
import { assert, assertNever } from '../assert';
import { EMPTY_OBJECT } from '../const';
import { constantNormalizer, dedobs, TDedobsOptions } from '../observable/memo';
import { logErrorAndFail } from '../Rx/log';
import { progressiveRetry } from '../Rx/progressiveRetry';
import { extractValueDescriptorFromError } from '../Rx/ValueDescriptor2';
import { shallowHash } from '../shallowHash';
import { logger as globalLogger } from '../Tracing';
import { Binding } from '../Tracing/Children/Binding';
import { TValueDescriptor2 } from '../ValueDescriptor/types';
import {
    createSyncedValueDescriptor,
    isValueDescriptor,
    LOADING_VD,
} from '../ValueDescriptor/utils';
import {
    EActorRemoteProcedureName,
    EBffSocketRemoteProcedureName,
    EPlatformSocketRemoteProcedureName,
    ERemoteProcedureType,
} from './defs';
import {
    ExtractOptions,
    ExtractParams,
    ExtractReceive,
    ExtractTransport,
    ExtractTransportParams,
    TActorOptions,
    TPlatformSocketOptions,
    TRemoteProcedureDescriptor,
} from './types';
import { purifyProcedureName } from './utils.ts';

type TResultValueDescriptor<T> = T extends TValueDescriptor2<any> ? T : TValueDescriptor2<T>;

type TProcedure<Params, Options, Result> = (
    params: Params,
    options: Options,
) => Observable<TResultValueDescriptor<Result>>;

type TSetting<
    D extends TRemoteProcedureDescriptor<any, any, any>,
    Params extends TStructurallyCloneable,
    Result extends TStructurallyCloneable,
> = {
    getParams?: (params: Params, options: ExtractOptions<D>) => ExtractParams<D>;
    dedobs?: TDedobsOptions<[Params, ExtractOptions<D>]>;
    getPipe?: (
        params: Params,
        options: ExtractOptions<D>,
    ) => OperatorFunction<ExtractReceive<D>, Result>;
    retry?: MonoTypeOperatorFunction<TResultValueDescriptor<Result>>;
    logger?: typeof globalLogger;
};

const DEFAULT_SETTINGS: TSetting<any, any, any> = EMPTY_OBJECT;

export function createRemoteProcedureCall<D extends TRemoteProcedureDescriptor<any, any, any>>(
    descriptor: D,
) {
    return function <
        Params extends TStructurallyCloneable = ExtractParams<D>,
        Result extends TStructurallyCloneable = ExtractReceive<D>,
    >(settings: TSetting<D, Params, Result> = DEFAULT_SETTINGS) {
        const logger =
            settings.logger ??
            globalLogger.child(new Binding(`RemoteProcedureCall:${descriptor.name}`));
        const createProcedure =
            (transport: ExtractTransport<D>) =>
            (
                _params: Params,
                options: ExtractOptions<D>,
            ): Observable<TResultValueDescriptor<Result>> => {
                const params = (settings.getParams?.(_params, options) ??
                    _params) as ExtractParams<D>;

                logger.trace(`Init`, descriptor, params);

                const mapper = isFunction(settings.getPipe)
                    ? settings.getPipe(params, options)
                    : map<ExtractReceive<D>, Result>((envelope) => envelope as unknown as Result);

                return transport({ params, options } as ExtractTransportParams<D>).pipe(
                    mapper,

                    map((envelope) => {
                        return (
                            isValueDescriptor(envelope)
                                ? envelope
                                : createSyncedValueDescriptor(envelope)
                        ) as TResultValueDescriptor<Result>;
                    }),

                    startWith(LOADING_VD as TResultValueDescriptor<Result>),
                );
            };

        assert(
            isUndefined(settings.dedobs) || descriptor.type !== ERemoteProcedureType.Update,
            `dedobs is not supported for Update procedures`,
        );

        const useDedobs = !isUndefined(settings.dedobs);

        const withDedobs =
            (options?: TDedobsOptions<[Params, ExtractOptions<D>]>) =>
            (procedure: TProcedure<Params, ExtractOptions<D>, Result>) => {
                return useDedobs && !isUndefined(options) ? dedobs(procedure, options) : procedure;
            };

        const withLogs =
            (procedure: TProcedure<Params, ExtractOptions<D>, Result>) =>
            (params: Params, options: ExtractOptions<D>) => {
                const useLogs = !(options.enableLogs === false);

                if (!useLogs) return procedure(params, options);
                return procedure(params, options).pipe(logErrorAndFail(logger.error));
            };

        const withRetry =
            (procedure: TProcedure<Params, ExtractOptions<D>, Result>) =>
            (params: Params, options: ExtractOptions<D>) => {
                const useRetry = !(
                    descriptor.type === ERemoteProcedureType.Update ||
                    options.enableRetries === false
                );

                if (!useRetry) return procedure(params, options);
                return procedure(params, options).pipe(
                    extractValueDescriptorFromError(),
                    isFunction(settings.retry) ? settings.retry : progressiveRetry(),
                );
            };

        const transportOptionsNormalizer = useDedobs
            ? descriptor.name in EActorRemoteProcedureName
                ? getActorOptionsDedobsKey
                : descriptor.name in EPlatformSocketRemoteProcedureName
                  ? getPlatformSocketOptionsDedobsKey
                  : getBffSocketOptionsDedobsKey
            : undefined;
        const rootNormalizer = (args: [Params, ExtractOptions<D>]) => {
            return shallowHash(
                settings.dedobs?.normalize?.(args),
                transportOptionsNormalizer?.(args),
            );
        };
        const logsNormalizer = (args: [Params, ExtractOptions<D>]) => {
            return shallowHash(rootNormalizer(args), Boolean(args[1].enableLogs));
        };
        const retryNormalizer = (args: [Params, ExtractOptions<D>]) => {
            return shallowHash(
                rootNormalizer(args),
                Boolean(args[1].enableLogs),
                Boolean(args[1].enableRetries),
            );
        };

        const finalize = pipe(
            withDedobs({
                ...settings.dedobs,
                normalize: rootNormalizer,
            }),
            withLogs,
            withDedobs({ normalize: logsNormalizer, removeDelay: 0, resetDelay: 0 }),
            withRetry,
            withDedobs({ normalize: retryNormalizer, removeDelay: 0, resetDelay: 0 }),
        );

        return ModuleFactory(
            (
                ctx: TContextRef,
            ): ((
                params: Params,
                options: ExtractOptions<D>,
            ) => Observable<TResultValueDescriptor<Result>>) => {
                const transport =
                    descriptor.name in EActorRemoteProcedureName
                        ? getActorTransport(ctx, descriptor)
                        : descriptor.name in EPlatformSocketRemoteProcedureName
                          ? getPlatformSocketTransport(ctx, descriptor)
                          : getBffSocketTransport(ctx, descriptor);
                const procedure = createProcedure(transport);

                return finalize(procedure);
            },
        );
    };
}

function getActorTransport<
    D extends TRemoteProcedureDescriptor<EActorRemoteProcedureName, any, any>,
>(ctx: TContextRef, descriptor: D) {
    const actor = ModuleActor(ctx);

    const request =
        descriptor.type === ERemoteProcedureType.Subscribe
            ? createActorObservableBox<ExtractTransportParams<D>, ExtractReceive<D>>()(
                  descriptor.name,
              ).requestStream
            : createActorRequestBox<ExtractTransportParams<D>, ExtractReceive<D>>()(descriptor.name)
                  .request;

    return ({ params, options }: ExtractTransportParams<D>) => {
        return request(actor, {
            params,
            options: { traceId: options.traceId },
        } as ExtractTransportParams<D>);
    };
}

function getActorOptionsDedobsKey([]: [unknown, TActorOptions]) {
    return constantNormalizer();
}

function getPlatformSocketTransport<
    D extends TRemoteProcedureDescriptor<EPlatformSocketRemoteProcedureName, any, any>,
>(ctx: TContextRef, descriptor: D) {
    const handlers = ModuleCommunicationHandlersRemoted(ctx);

    return ({
        params: _params,
        options: _options,
    }: ExtractTransportParams<D>): Observable<ExtractReceive<D>> => {
        const target = _params.target;
        const params = {
            ..._params,
            target: undefined,
            type: purifyProcedureName(descriptor.name),
        };
        const options = { ..._options, ...NO_RETRIES, enableVD: true };

        if (descriptor.type === ERemoteProcedureType.Subscribe) {
            return handlers.requestStream(
                target,
                () => [params, { type: 'Unsubscribe' }],
                options,
            ) as Observable<ExtractReceive<D>>;
        }

        if (descriptor.type === ERemoteProcedureType.Request) {
            return handlers.request(target, params, options) as Observable<ExtractReceive<D>>;
        }

        if (descriptor.type === ERemoteProcedureType.Update) {
            return handlers.update(target, params, options) as Observable<ExtractReceive<D>>;
        }

        assertNever(descriptor.type);
    };
}

function getPlatformSocketOptionsDedobsKey([, options]: [unknown, TPlatformSocketOptions]) {
    return Boolean(options.skipAuthentication);
}

// TODO: IMPORT FROM CONFIGS
const BFF_URL = 'wss://bff' as TSocketURL;
function getBffSocketTransport<
    D extends TRemoteProcedureDescriptor<EBffSocketRemoteProcedureName, any, any>,
>(ctx: TContextRef, descriptor: D) {
    throw new Error('Not implemented');
    const handlers = ModuleCommunicationHandlersRemoted(ctx);

    return ({
        params: _params,
        options: _options,
    }: ExtractTransportParams<D>): Observable<ExtractReceive<D>> => {
        const params = { ..._params, type: descriptor.name };
        const options = { ..._options, ...NO_RETRIES };

        if (descriptor.type === ERemoteProcedureType.Subscribe) {
            return handlers.requestStream(
                BFF_URL,
                () => [params, { type: 'Unsubscribe' }],
                options,
            ) as Observable<ExtractReceive<D>>;
        }

        if (descriptor.type === ERemoteProcedureType.Request) {
            return handlers.request(BFF_URL, params, options) as Observable<ExtractReceive<D>>;
        }

        if (descriptor.type === ERemoteProcedureType.Update) {
            return handlers.update(BFF_URL, params, options) as Observable<ExtractReceive<D>>;
        }

        assertNever(descriptor.type);
    };
}

function getBffSocketOptionsDedobsKey([, options]: [unknown, TPlatformSocketOptions]) {
    return Boolean(options.skipAuthentication);
}
