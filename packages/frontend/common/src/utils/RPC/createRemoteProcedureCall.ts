import type { TRemoteProcedureDescriptor } from '@common/rpc';
import { cleanProcedureName } from '@common/rpc';
import type { TStructurallyCloneable } from '@common/types';
import { getNowMilliseconds } from '@common/utils';
import { assert, assertNever } from '@common/utils/src/assert.ts';
import pipe from 'lodash/fp/pipe';
import { isFunction, isUndefined } from 'lodash-es';
import type { Observable, OperatorFunction } from 'rxjs';
import { map, startWith, tap } from 'rxjs/operators';

import type { TContextRef } from '../../di';
import { ModuleFactory } from '../../di';
import { NO_RETRIES } from '../../modules/actions/def.ts';
import { ModuleActor } from '../../modules/actor';
import { ModuleCommunicationHandlers } from '../../modules/communicationHandlers';
import { ModuleSubscriptionsState } from '../../modules/subscriptionsState';
import { createActorObservableBox } from '../Actors/observable';
import { EMPTY_OBJECT } from '../const';
import { isSharedWorker } from '../detect.ts';
import { identity } from '../identity.ts';
import type { TDedobsOptions } from '../observable/memo';
import {
    constantNormalizer,
    dedobs,
    DEDOBS_SKIP_KEY,
    DEFAULT_NORMALIZER,
} from '../observable/memo';
import { logErrorAndFail } from '../Rx/log';
import type { TProgressiveRetryConfig } from '../Rx/progressiveRetry';
import { progressiveRetryValueDescriptor } from '../Rx/progressiveRetry';
import { shallowHash } from '../shallowHash';
import { logger as globalLogger } from '../Tracing';
import { Binding } from '../Tracing/Children/Binding';
import { convertObjectToLogMessage } from '../Tracing/utils.ts';
import type { TValueDescriptor2 } from '../ValueDescriptor/types';
import {
    createSyncedValueDescriptor,
    isValueDescriptor,
    REQUESTING_VD,
} from '../ValueDescriptor/utils';
import type { EPlatformSocketRemoteProcedureName } from './defs';
import { EActorRemoteProcedureName, ERemoteProcedureType } from './defs';
import type {
    ExtractOptions,
    ExtractParams,
    ExtractReceive,
    ExtractTransport,
    ExtractTransportParams,
    TActorOptions,
    TPlatformSocketOptions,
} from './types';

type TResultValueDescriptor<T> = T extends TValueDescriptor2<any> ? T : TValueDescriptor2<T>;

type TProcedure<Params, Options, Result> = (
    params: Params,
    options: Options,
) => Observable<TResultValueDescriptor<Result>>;

type TProcedureDedobsOptions<Args extends unknown[]> = Required<
    Pick<TDedobsOptions<Args>, 'normalize' | 'resetDelay' | 'removeDelay'>
> &
    Pick<TDedobsOptions<Args>, 'replayCount' | 'removeUnsubscribedDelay'>;

type TSetting<
    D extends TRemoteProcedureDescriptor<any, any, any>,
    Params extends TStructurallyCloneable,
    Result extends TStructurallyCloneable,
> = {
    getParams?: (params: Params, options: ExtractOptions<D>) => ExtractParams<D>;
    dedobs?: TProcedureDedobsOptions<[Params, ExtractOptions<D>]>;
    getPipe?: (
        originalParams: Params,
        options: ExtractOptions<D>,
        params: ExtractParams<D>,
    ) => OperatorFunction<ExtractReceive<D>, Result>;
    retry?: TProgressiveRetryConfig<TResultValueDescriptor<Result>>;
};

const DEFAULT_SETTINGS: TSetting<any, any, any> = EMPTY_OBJECT;

export function createRemoteProcedureCall<D extends TRemoteProcedureDescriptor<any, any, any>>(
    descriptor: D,
) {
    return function <
        Params extends TStructurallyCloneable = ExtractParams<D>,
        Result extends TStructurallyCloneable = ExtractReceive<D>,
    >(settings: TSetting<D, Params, Result> = DEFAULT_SETTINGS) {
        const createProcedure =
            (transport: ExtractTransport<D>, ctx: TContextRef) =>
            (
                originalParams: Params,
                options: ExtractOptions<D>,
            ): Observable<TResultValueDescriptor<Result>> => {
                const { upsertSubscription, deleteSubscription } = ModuleSubscriptionsState(ctx);

                const params = (settings.getParams?.(originalParams, options) ??
                    originalParams) as ExtractParams<D>;
                const useLogs = !(options.enableLogs === false);

                const rpcLogger = useLogs
                    ? globalLogger.child([
                          new Binding(`RPC`),
                          new Binding(descriptor.name),
                          { params: convertObjectToLogMessage(params), traceId: options.traceId },
                      ])
                    : undefined;

                rpcLogger?.info(`call`);

                const mapper = isFunction(settings.getPipe)
                    ? settings.getPipe(originalParams, options, params)
                    : map<ExtractReceive<D>, Result>((envelope) => envelope as unknown as Result);

                const registerProcedureCall = (
                    descriptor: D,
                    params: Params,
                    options: ExtractOptions<D>,
                ) => {
                    const key = registerProcedureCallKey([descriptor, params, options]);

                    return tap<TResultValueDescriptor<Result>>({
                        next: (valueDescriptor) => {
                            upsertSubscription({
                                key,
                                descriptor,
                                valueDescriptor,
                                params,
                                options,
                                updateTime: getNowMilliseconds(),
                                finished: false,
                            });
                        },
                        finalize: () => {
                            deleteSubscription(key);
                        },
                    });
                };

                return transport({ params, options } as ExtractTransportParams<D>).pipe(
                    mapper,

                    map((envelope) => {
                        return (
                            isValueDescriptor(envelope)
                                ? envelope
                                : createSyncedValueDescriptor(envelope)
                        ) as TResultValueDescriptor<Result>;
                    }),

                    startWith(REQUESTING_VD as TResultValueDescriptor<Result>),
                    // Do not collect subscriptions info in SharedWorker,
                    // as we're only interested in such info from local tabs (for now)
                    isSharedWorker
                        ? identity
                        : registerProcedureCall(descriptor, originalParams, options),
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
                const logger = globalLogger.child([
                    new Binding(`RPC`),
                    new Binding(descriptor.name),
                ]);

                return procedure(params, options).pipe(
                    tap((vd) => {
                        logger.info('response', {
                            state: vd.state,
                            meta: vd.meta,
                            fail: vd.fail,
                            // Prevent leaking sensitive data from response payloads
                            value: convertObjectToLogMessage(vd.value),
                        });
                    }),
                    logErrorAndFail(logger.error),
                );
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
                    progressiveRetryValueDescriptor(settings.retry),
                );
            };

        const transportOptionsNormalizer = useDedobs
            ? descriptor.name in EActorRemoteProcedureName
                ? getActorOptionsDedobsKey
                : getPlatformSocketOptionsDedobsKey
            : undefined;
        const rootNormalizer = (args: [Params, ExtractOptions<D>]) => {
            const key = (settings.dedobs?.normalize ?? DEFAULT_NORMALIZER)(args);
            return key === DEDOBS_SKIP_KEY
                ? key
                : shallowHash(key, transportOptionsNormalizer?.(args));
        };
        const logsNormalizer = (args: [Params, ExtractOptions<D>]) => {
            const key = rootNormalizer(args);
            return key === DEDOBS_SKIP_KEY ? key : shallowHash(key, Boolean(args[1].enableLogs));
        };
        const retryNormalizer = (args: [Params, ExtractOptions<D>]) => {
            const key = rootNormalizer(args);
            return key === DEDOBS_SKIP_KEY
                ? key
                : shallowHash(key, Boolean(args[1].enableLogs), Boolean(args[1].enableRetries));
        };
        const registerProcedureCallKey = (args: [D, Params, ExtractOptions<D>]) => {
            const [descriptor, params, options] = args;
            return shallowHash(rootNormalizer([params, options]), descriptor);
        };

        const finalizePipe = pipe(
            withDedobs({
                ...settings.dedobs,
                normalize: rootNormalizer,
            }),
            withLogs,
            withDedobs({
                normalize: logsNormalizer,
                removeDelay: 0,
                resetDelay: 0,
                replayCount: settings.dedobs?.replayCount,
            }),
            withRetry,
            withDedobs({
                normalize: retryNormalizer,
                removeDelay: 0,
                resetDelay: 0,
                replayCount: settings.dedobs?.replayCount,
            }),
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
                        : getPlatformSocketTransport(ctx, descriptor);
                const procedure = createProcedure(transport, ctx);

                return finalizePipe(procedure);
            },
        );
    };
}

function getActorTransport<
    D extends TRemoteProcedureDescriptor<EActorRemoteProcedureName, any, any>,
>(ctx: TContextRef, descriptor: D) {
    const actor = ModuleActor(ctx);

    return ({ params, options }: ExtractTransportParams<D>) => {
        return createActorObservableBox<ExtractTransportParams<D>, ExtractReceive<D>>({
            useLogger: false,
        })(descriptor.name).requestStream(actor, {
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
    const handlers = ModuleCommunicationHandlers(ctx);

    return ({
        params: _params,
        options: _options,
    }: ExtractTransportParams<D>): Observable<ExtractReceive<D>> => {
        const target = _params.target;
        const params = {
            ..._params,
            target: undefined,
            type: cleanProcedureName(descriptor.name),
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
