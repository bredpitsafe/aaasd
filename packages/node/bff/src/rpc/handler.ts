import {
    catchError,
    distinctUntilChanged,
    EMPTY,
    filter,
    map,
    mergeMap,
    Observable,
    of,
    take,
    takeUntil,
    takeWhile,
    tap,
    throwError,
    timeout,
} from 'rxjs';

import {
    ERpcErrorCode,
    ERpcResponseState,
    TRpcRequest,
    TRpcResponse,
    TRpcResponsePayload,
} from '../def/rpc.ts';
import { EMetricsLabels } from '../modules/metrics/def.ts';
import { metrics } from '../modules/metrics/service.ts';
import { EGeneralRouteName } from '../modules/root/def.ts';
import { appConfig } from '../utils/appConfig.ts';
import { tapOnce } from '../utils/rx/tapOnce.ts';
import { assertNever } from '../utils/types.ts';
import { RpcRequestContext } from './context.ts';
import {
    ERpcMethod,
    TRpcResponseWithContext,
    TRpcRoute,
    TRpcRoutesMap,
    TRpcSession,
} from './def.ts';
import { notAuthenticatedError, requestTimeoutError, RpcError, toRpcError } from './errors.ts';

export class RpcHandler {
    constructor(private routesMap: TRpcRoutesMap) {}

    handleRequest(
        session: TRpcSession,
        req$: Observable<TRpcRequest>,
    ): Observable<TRpcResponseWithContext> {
        return req$.pipe(
            map((req) => ({
                req,
                ctx: RpcRequestContext.create({
                    session,
                    req,
                    route: this.getRoute(req),
                }),
            })),
            mergeMap(({ req, ctx }) => {
                return of(undefined).pipe(
                    tap(() => {
                        ctx.logger.info({ message: 'Received incoming request' });
                        metrics.messages.total.inc({
                            [EMetricsLabels.Type]: req.payload.type,
                        });
                    }),
                    mergeMap(() => {
                        switch (ctx.route.method) {
                            case ERpcMethod.CALL:
                                return this.handleCall(req, ctx);
                            case ERpcMethod.SUBSCRIBE: {
                                const unsubscribe$ = req$.pipe(
                                    filter(
                                        (req) => req.payload.type === EGeneralRouteName.Unsubscribe,
                                    ),
                                );
                                return this.handleSubscribe(req, ctx).pipe(takeUntil(unsubscribe$));
                            }
                            default:
                                assertNever(ctx.route.method);
                        }
                    }),
                    catchError((error: unknown) => of(this.createErrorResponse(error, ctx))),
                    map((res) => ({ res, ctx })),
                );
            }),
            takeWhile(({ res }) => res.state !== ERpcResponseState.Done, true /* inclusive */),
        );
    }

    private handleCall(req: TRpcRequest, ctx: RpcRequestContext): Observable<TRpcResponse> {
        const { logger } = ctx;

        return of(undefined).pipe(
            tap(() => {
                logger.debug({ message: '`handleCall` -  started' });
            }),
            mergeMap(() => {
                return this.handle(req, ctx).pipe(
                    take(1),
                    map((resPayload) =>
                        this.createSuccessResponse(req, resPayload, ERpcResponseState.Done),
                    ),
                );
            }),
            catchError((error: unknown) => of(this.createErrorResponse(error, ctx))),
        );
    }

    private handleSubscribe(req: TRpcRequest, ctx: RpcRequestContext): Observable<TRpcResponse> {
        const { logger } = ctx;

        return of(undefined).pipe(
            tap(() => {
                logger.debug({ message: '`handleSubscribe` -  started' });
            }),
            mergeMap(() => {
                const startTime = performance.now();

                return this.handle(req, ctx).pipe(
                    tapOnce(() => {
                        const duration = performance.now() - startTime;
                        metrics.messages.responseDuration.observe(
                            { [EMetricsLabels.Type]: req.payload.type },
                            duration,
                        );
                    }),
                    map((resPayload: TRpcResponsePayload) =>
                        this.createSuccessResponse(req, resPayload, ERpcResponseState.InProgress),
                    ),
                );
            }),
            catchError((error: unknown) => of(this.createErrorResponse(error, ctx))),
        );
    }

    private handle(req: TRpcRequest, ctx: RpcRequestContext): Observable<TRpcResponsePayload> {
        const { logger } = ctx;

        return of(undefined).pipe(
            tap(() => {
                logger.debug({ message: '`handle` -  started' });
            }),
            mergeMap(() => {
                const authCheck$ = !ctx.route.options?.skipAuth ? this.checkAuth(ctx) : EMPTY;

                return ctx.route.handler(req, ctx).pipe(
                    takeUntil(authCheck$),
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
        return {
            timestamp: new Date().toISOString(),
            traceId,
            correlationId,
            state,
            payload,
        };
    }

    private createErrorResponse(error: unknown, ctx: RpcRequestContext): TRpcResponse {
        return {
            timestamp: new Date().toISOString(),
            error: toRpcError(error),
            traceId: ctx.req.traceId,
            correlationId: ctx.req.correlationId,
            state: ERpcResponseState.Done,
        };
    }

    private checkAuth({ session }: RpcRequestContext): Observable<never> {
        return session.isAuthenticated$.pipe(
            distinctUntilChanged(),
            filter((isAuthenticated) => {
                console.log({ isAuthenticated });
                return !isAuthenticated;
            }),
            map(() => {
                throw notAuthenticatedError();
            }),
        );
    }

    private getRoute(req: TRpcRequest): TRpcRoute {
        const route = this.routesMap[req.payload.type];
        if (!route) {
            throw new RpcError(
                ERpcErrorCode.INVALID_ARGUMENT,
                `Route for ${req.payload.type} not found`,
                { type: req.payload.type },
            );
        }
        return route;
    }
}
