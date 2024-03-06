import { isFunction, isUndefined } from 'lodash-es';
import { Observable, OperatorFunction } from 'rxjs';
import { finalize, map } from 'rxjs/operators';

import { ModuleFactory, TContextRef, TModuleConstructor } from '../../di';
import type { THandlerStreamOptions, TSubscribed, TUnsubscribe } from '../../handlers/def';
import { TReceivedData, TSendPayload } from '../../lib/BFFSocket/def';
import { ModuleMessages } from '../../lib/messages';
import { SocketStreamError } from '../../lib/SocketStream/SocketStreamError';
import { ModuleCommunicationHandlers } from '../../modules/communicationHandlers';
import {
    TFetchHandler,
    THandlerOptions,
    TStreamHandler,
} from '../../modules/communicationHandlers/def';
import { ModuleCommunicationHandlersRemoted } from '../../modules/communicationRemoteHandlers';
import { ModuleNotifications } from '../../modules/notifications/module';
import { Assign } from '../../types';
import type { TSocketStruct, TSocketURL } from '../../types/domain/sockets';
import type {
    TStructurallyCloneable,
    TStructurallyCloneableObject,
} from '../../types/serialization';
import { assert } from '../assert';
import { isWindow } from '../detect';
import { noop } from '../fn';
import { tapError, tapOnce } from '../Rx/tap';
import type { TraceId } from '../traceId';
import { logger } from '../Tracing';

type TServerResourceArgs<
    Params extends TStructurallyCloneable,
    Options extends TStructurallyCloneable = Assign<THandlerOptions, { traceId: TraceId }>,
> = [target: TSocketURL | TSocketStruct, params: Params, options: Options];

type TServerResource<Send extends TStructurallyCloneable, Receive> = (
    ...args: TServerResourceArgs<Send>
) => Observable<Receive>;

export const ServerStreamResourceModuleFactory = createStreamFactory(
    (ctx) => ModuleCommunicationHandlers(ctx).requestStream,
);

export const ServerResourceModuleFactory = createFactory(
    (ctx) => ModuleCommunicationHandlersRemoted(ctx).request,
);

export const ServerUpdateModuleFactory = createFactory(
    (ctx) => ModuleCommunicationHandlersRemoted(ctx).update,
);

function createFactory(getHandler: (ctx: TContextRef) => TFetchHandler) {
    return function ServerModuleFactory<
        Send extends Omit<TSendPayload, 'type'>,
        Receive extends TStructurallyCloneableObject,
    >(type: string, defaultHandlerOptions?: Omit<THandlerOptions, 'traceId'>) {
        return function <Params extends TStructurallyCloneable = Send, Result = Receive>(
            requestOptionsFactory?: (...args: TServerResourceArgs<Params>) => {
                params?: Send;
                extendPipe?: OperatorFunction<TReceivedData<Receive>, Result>;
            },
        ) {
            return ModuleFactory((ctx: TContextRef) => {
                const handler = getHandler(ctx);

                return (
                    target: TSocketURL | TSocketStruct,
                    params: Params,
                    handlerOptions: Assign<THandlerOptions, { traceId: TraceId }>,
                ): Observable<Result> => {
                    const options = { ...defaultHandlerOptions, ...handlerOptions };

                    logger.trace(`[${type}]: Init`, { target, params, options });

                    const requestOptions = isUndefined(requestOptionsFactory)
                        ? undefined
                        : requestOptionsFactory(target, params, options);
                    const receive$ = handler<TSendPayload, Receive>(
                        target,
                        { type, ...((requestOptions?.params ?? params) as Send) },
                        options,
                    );

                    return receive$.pipe(
                        requestOptions?.extendPipe ??
                            map<TReceivedData<Receive>, Result>(
                                (envelope) => envelope.payload as unknown as Result,
                            ),
                        tapError((err: SocketStreamError) =>
                            logger.error(`[${type}]: Fail`, err.toJSON()),
                        ),
                    );
                };
            });
        };
    };
}

function createStreamFactory(getHandler: (ctx: TContextRef) => TStreamHandler) {
    return function ServerModuleFactory<
        Send extends Omit<TSendPayload, 'type'>,
        Receive extends TStructurallyCloneableObject,
    >(type: string, defaultHandlerOptions?: Omit<THandlerStreamOptions, 'traceId'>) {
        return function <
            Params extends TStructurallyCloneable = Send,
            Result = Receive | TSubscribed,
        >(
            requestOptionsFactory?: (
                ...args: TServerResourceArgs<
                    Params,
                    Assign<THandlerStreamOptions, { traceId: TraceId }>
                >
            ) => {
                params?: Send;
                extendPipe?: OperatorFunction<TReceivedData<TSubscribed | Receive>, Result>;
            },
        ) {
            return ModuleFactory((ctx: TContextRef) => {
                const handler = getHandler(ctx);

                return (
                    target: TSocketURL | TSocketStruct,
                    params: Params,
                    handlerOptions: Assign<THandlerStreamOptions, { traceId: TraceId }>,
                ): Observable<Result> => {
                    const options = { ...defaultHandlerOptions, ...handlerOptions };

                    logger.trace(`[${type}]: Init stream`, {
                        target,
                        params,
                        options,
                    });

                    const requestOptions = isUndefined(requestOptionsFactory)
                        ? undefined
                        : requestOptionsFactory(target, params, options);
                    const receive$ = handler<TSendPayload | TUnsubscribe, Receive | TSubscribed>(
                        target,
                        () => [
                            { type, ...((requestOptions?.params ?? params) as Send) },
                            { type: 'Unsubscribe' },
                        ],
                        options,
                    );

                    return receive$.pipe(
                        requestOptions?.extendPipe ??
                            map<TReceivedData<TSubscribed | Receive>, Result>(
                                (envelope) => envelope.payload as unknown as Result,
                            ),
                        tapError((err: SocketStreamError) =>
                            logger.error(`[${type}]: Fail`, err.toJSON()),
                        ),
                    );
                };
            });
        };
    };
}

export function ServerActionModuleFactory<
    Send extends Omit<TSendPayload, 'type'>,
    Receive extends TStructurallyCloneable,
>(resourceFactory: TModuleConstructor<TServerResource<Send, Receive>>) {
    assert(isWindow, '[ServerActionModuleFactory] Can be used only in Window context');

    return function <Params extends TStructurallyCloneable = Send, Result = Receive>(
        requestOptionsFactory?: (...args: TServerResourceArgs<Params>) => {
            params?: Send;
            loading?: () => string;
            success?: () => string;
            error?: (err: Error | SocketStreamError) => {
                message: string;
                description: string;
            };
            extendPipe?: (resource: Observable<Receive>) => Observable<Result>;
        },
    ) {
        return ModuleFactory((ctx: TContextRef) => {
            const notify = ModuleNotifications(ctx);
            const messages = ModuleMessages(ctx);
            const resource = resourceFactory(ctx);

            return (
                target: TSocketURL | TSocketStruct,
                params: Params,
                options: Assign<THandlerOptions, { traceId: TraceId }>,
            ): Observable<Result> => {
                const requestOptions = isUndefined(requestOptionsFactory)
                    ? undefined
                    : requestOptionsFactory(target, params, options);
                const close = isUndefined(requestOptions?.loading)
                    ? noop
                    : messages.loading(requestOptions!.loading(), 5000);
                const resource$ = resource(
                    target,
                    (requestOptions?.params ?? params) as Send,
                    options,
                );

                return (
                    isFunction(requestOptions?.extendPipe)
                        ? requestOptions!.extendPipe(resource$)
                        : (resource$ as unknown as Observable<Result>)
                ).pipe(
                    tapOnce(() => {
                        if (!isUndefined(requestOptions?.success)) {
                            void messages.success(requestOptions!.success());
                        }
                    }),
                    tapError((err: Error | SocketStreamError) => {
                        const messageAndDescription = isUndefined(requestOptions?.error)
                            ? undefined
                            : requestOptions!.error(err);

                        notify.error({
                            message: isUndefined(messageAndDescription)
                                ? `Fail`
                                : messageAndDescription.message,
                            description: isUndefined(messageAndDescription)
                                ? err.message
                                : messageAndDescription.description,
                            traceId: err instanceof SocketStreamError ? err.traceId : undefined,
                        });
                    }),
                    finalize(close),
                );
            };
        });
    };
}
