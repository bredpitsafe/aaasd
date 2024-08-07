import type { TCorrelationId } from '@backend/utils/src/correlationId.ts';
import { tapOnce } from '@common/rx';
import type { TraceId } from '@common/utils';
import { assertNever } from '@common/utils';
import { isNil } from 'lodash-es';
import type { Observable } from 'rxjs';
import {
    catchError,
    distinctUntilChanged,
    endWith,
    filter,
    map,
    mergeMap,
    of,
    switchMap,
    take,
    takeUntil,
    takeWhile,
    tap,
    throwError,
    timeout,
} from 'rxjs';

import type { TRpcRequest, TRpcResponse, TRpcResponsePayload, TRpcRouteName } from '../def/rpc.ts';
import { ERpcErrorCode, ERpcResponseState } from '../def/rpc.ts';
import { EMetricsLabels } from '../modules/metrics/def.ts';
import { metrics } from '../modules/metrics/service.ts';
import { EGeneralRouteName } from '../modules/root/def.ts';
import { appConfig } from '../utils/appConfig.ts';
import { RpcRequestContext } from './context.ts';
import type { TRpcResponseWithContext, TRpcRoute, TRpcRoutesMap, TRpcSession } from './def.ts';
import { ERpcMethod } from './def.ts';
import {
    notAuthenticatedError,
    requestTimeoutError,
    RpcError,
    toRpcError,
    validationFailError,
} from './errors.ts';

export class RpcHandler {
    constructor(private routesMap: TRpcRoutesMap) {}

    handleRequest<T extends TRpcRouteName>(
        session: TRpcSession,
        req$: Observable<TRpcRequest<T>>,
    ): Observable<TRpcResponseWithContext<T>> {
        return req$.pipe(
            map((req) => {
                // TODO: Investigate type error that TS produces. The assigned type should be correct.
                // @ts-ignore
                const route: TRpcRoute<T> | undefined = this.routesMap[req.payload.type];

                return new RpcRequestContext({
                    session,
                    req,
                    route,
                });
            }),
            mergeMap((ctx) => {
                return of(undefined).pipe(
                    tap(() => {
                        ctx.logger.info({ message: 'Received incoming request' });
                        metrics.messages.incoming.inc({
                            [EMetricsLabels.Type]: ctx.req.payload.type,
                            [EMetricsLabels.Stage]: ctx.stage,
                        });
                    }),
                    mergeMap(() => {
                        if (isNil(ctx.route)) {
                            return throwError(() =>
                                validationFailError(
                                    `missing request route: invalid 'type' field value`,
                                ),
                            );
                        }

                        switch (ctx.route.method) {
                            case ERpcMethod.CALL:
                                return this.handleCall(ctx);
                            case ERpcMethod.SUBSCRIBE: {
                                const unsubscribe$ = req$.pipe(
                                    filter(
                                        (req) => req.payload.type === EGeneralRouteName.Unsubscribe,
                                    ),
                                );
                                return this.handleSubscribe(ctx).pipe(takeUntil(unsubscribe$));
                            }
                            default:
                                assertNever(ctx.route.method);
                        }
                    }),
                    catchError((error: unknown) => {
                        ctx.logger.error({
                            message: 'Creating RPC error response from generic error',
                            error,
                        });
                        return of(
                            this.createErrorResponse(error, ctx.req.traceId, ctx.req.correlationId),
                        );
                    }),
                    map((res) => ({ res, ctx })),
                    tap(({ ctx }) => {
                        metrics.messages.outgoing.inc({
                            [EMetricsLabels.Type]: ctx.req.payload.type,
                            [EMetricsLabels.Stage]: ctx.stage,
                        });
                    }),
                );
            }),
            takeWhile(({ res }) => res.state !== ERpcResponseState.Done, true /* inclusive */),
        );
    }

    private handleCall<T extends TRpcRouteName>(
        ctx: RpcRequestContext<T>,
    ): Observable<TRpcResponse> {
        const { logger, req, route } = ctx;

        const response$ = of(undefined).pipe(
            tap(() => {
                logger.debug({ message: '`handleCall` -  started' });
            }),
            mergeMap(() => {
                return this.handle(ctx).pipe(
                    take(1),
                    map((resPayload) =>
                        this.createSuccessResponse(req, resPayload, ERpcResponseState.Done),
                    ),
                );
            }),
            catchError((error: unknown) => {
                ctx.logger.error({
                    message: 'Creating RPC error response from generic error',
                    error,
                });
                return of(this.createErrorResponse(error, ctx.req.traceId, ctx.req.correlationId));
            }),
        );

        // If the route explicitly states that it will *not* return a response,
        // prevent sending an error after observable ends
        if (route?.options?.emitResponse === false) {
            return response$;
        }

        // The route must return a response by default
        // (unless stated otherwise by using route.options.emitResponse)
        // If it doesn't, however, throw error to the output socket.
        return response$.pipe(
            endWith(
                this.createErrorResponse(
                    new RpcError(
                        ERpcErrorCode.ABORTED,
                        `RPC endpoint ended call without emitting a response`,
                    ),
                    ctx.req.traceId,
                    ctx.req.correlationId,
                ),
            ),
        );
    }

    private handleSubscribe<T extends TRpcRouteName>(
        ctx: RpcRequestContext<T>,
    ): Observable<TRpcResponse> {
        const { logger, req } = ctx;

        return of(undefined).pipe(
            tap(() => {
                logger.debug({ message: '`handleSubscribe` -  started' });
            }),
            mergeMap(() => {
                const startTime = performance.now();

                return this.handle(ctx).pipe(
                    tapOnce(() => {
                        const duration = performance.now() - startTime;
                        metrics.messages.firstResponseDuration.observe(
                            { [EMetricsLabels.Type]: req.payload.type },
                            duration / 1000,
                        );
                    }),
                    map((resPayload: TRpcResponsePayload) =>
                        this.createSuccessResponse(req, resPayload, ERpcResponseState.InProgress),
                    ),
                );
            }),
            catchError((error: unknown) => {
                ctx.logger.error({
                    message: 'Creating RPC error response from generic error',
                    error,
                });
                return of(this.createErrorResponse(error, ctx.req.traceId, ctx.req.correlationId));
            }),
            endWith(this.createDoneResponse(ctx.req.traceId, ctx.req.correlationId)),
            // End subscription on the first `Done` response
            takeWhile((res) => res.state !== ERpcResponseState.Done, true),
        );
    }

    private handle<T extends TRpcRouteName>(
        ctx: RpcRequestContext<T>,
    ): Observable<TRpcResponsePayload> {
        const { logger, route } = ctx;

        if (!route) {
            return throwError(() => validationFailError('missing request route'));
        }

        return of(undefined).pipe(
            tap(() => {
                logger.debug({ message: '`handle` -  started' });
            }),
            mergeMap(() => {
                // Skip authentication if route or service specifically mentions it
                const shouldSkipAuth = ctx.shouldSkipAuth();
                const authCheck$ = shouldSkipAuth
                    ? of(true)
                    : ctx.session.isAuthenticated$.pipe(distinctUntilChanged());

                logger.debug({ message: shouldSkipAuth ? 'skipping auth' : 'checking auth state' });

                return authCheck$.pipe(
                    switchMap((authenticated) => {
                        logger.debug({ message: 'auth state', authenticated });
                        if (!authenticated) {
                            return throwError(notAuthenticatedError);
                        }
                        return route.handler(ctx);
                    }),
                    timeout({
                        first: appConfig.rpc.timeout,
                        with: () => throwError(() => requestTimeoutError(appConfig.rpc.timeout)),
                    }),
                    tap({
                        next: (responsePayload) => {
                            logger.debug({
                                message: '`handle` - got response',
                                type: responsePayload?.type,
                            });
                        },
                        error: (error) => {
                            logger.error({
                                message: '`handle` - got error',
                                error,
                            });
                            logger.debug({ message: (error as Error).stack ?? '' });
                        },
                    }),
                );
            }),
        );
    }

    private createSuccessResponse(
        req: TRpcRequest,
        payload: TRpcResponsePayload,
        state: ERpcResponseState,
    ): TRpcResponse {
        const { traceId, correlationId } = req;
        // TODO: Something is wrong with new endpoint types here, investigate
        // @ts-ignore
        return {
            timestamp: new Date().toISOString(),
            traceId,
            correlationId,
            state,
            payload,
        };
    }

    public createErrorResponse(
        error: unknown,
        traceId: TraceId,
        correlationId: TCorrelationId,
    ): TRpcResponse {
        return {
            timestamp: new Date().toISOString(),
            error: toRpcError(error),
            traceId,
            correlationId,
            state: ERpcResponseState.Done,
        };
    }

    public createDoneResponse(traceId: TraceId, correlationId: TCorrelationId): TRpcResponse {
        return {
            timestamp: new Date().toISOString(),
            traceId,
            correlationId,
            state: ERpcResponseState.Done,
        };
    }
}
