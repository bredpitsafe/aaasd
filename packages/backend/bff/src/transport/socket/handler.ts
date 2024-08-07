import { generateCorrelationId } from '@backend/utils/src/correlationId.ts';
import { groupByWithCleanup } from '@common/rx';
import { generateTraceId } from '@common/utils';
import { isEmpty, isNil, isObject } from 'lodash-es';
import type { Observable } from 'rxjs';
import {
    catchError,
    concat,
    EMPTY,
    filter,
    fromEvent,
    identity,
    merge,
    mergeMap,
    of,
    switchMap,
    takeUntil,
    tap,
} from 'rxjs';
import type { ErrorEvent, MessageEvent } from 'ws';
import type WebSocket from 'ws';

import { EActorName } from '../../def/actor.ts';
import { UNCAUGHT_ERROR_CORRELATION_ID } from '../../def/constants.ts';
import type { TRpcRequest, TRpcResponse, TRpcRouteName } from '../../def/rpc.ts';
import { ERpcErrorCode } from '../../def/rpc.ts';
import { EGeneralRouteName } from '../../modules/root/def.ts';
import { rootRpcRoutes } from '../../modules/root/rpcRoutes.ts';
import type { RpcRequestContext } from '../../rpc/context.ts';
import type { TRpcSession } from '../../rpc/def.ts';
import { requestParseError, validationFailError } from '../../rpc/errors.ts';
import type { RpcHandler } from '../../rpc/handler.ts';
import { appConfig } from '../../utils/appConfig.ts';
import { defaultLogger } from '../../utils/logger.ts';
import type { SocketSession } from './session.ts';
import { SocketSessionManager } from './sessionManager.ts';

export class SocketHandler {
    private logger = defaultLogger.createChildLogger({ actor: EActorName.Socket });
    private sessionManager = new SocketSessionManager();
    private rpcHandler: RpcHandler;

    constructor(rpcHandler: RpcHandler) {
        this.rpcHandler = rpcHandler;
    }

    handleSocketConnect = (socket: WebSocket): Observable<void> => {
        const session = this.sessionManager.createSession(socket);

        const socketClose$ = fromEvent(socket, 'close').pipe(
            tap(() => this.handleSocketClose(session)),
        );

        const socketError$ = fromEvent<ErrorEvent>(socket, 'error', identity<ErrorEvent>).pipe(
            tap((error) => this.handleSocketError(session, error.error)),
        );

        const socketMessage$ = fromEvent(socket, 'message', identity<MessageEvent>).pipe(
            switchMap((event) => this.validateRequest(event.data, session)),
            filter((req): req is TRpcRequest => !isNil(req)),
            groupByWithCleanup((req) => req.correlationId),
            mergeMap((reqFlow$) => this.rpcHandler.handleRequest(session, reqFlow$)),
        );

        const serverHeartbeat$ = this.startServerHeartbeat(session);

        return merge(socketMessage$, serverHeartbeat$).pipe(
            takeUntil(socketError$),
            takeUntil(socketClose$),
            mergeMap((data) => {
                return this.handleSend(session, data.res, data.ctx);
            }),
            catchError((err: unknown, caught) => {
                // Upon receiving any unusual error here
                // We should log it, send response to the socket,
                // then continue socket messages stream normally
                this.logSocketError(session, err as Error);

                return concat(
                    this.handleSend(
                        session,
                        this.rpcHandler.createErrorResponse(
                            err,
                            generateTraceId(),
                            UNCAUGHT_ERROR_CORRELATION_ID,
                        ),
                    ),
                    caught,
                );
            }),
        );
    };

    private handleSocketClose(session: SocketSession) {
        this.sessionManager.delete(session.id);
    }

    private logSocketError(session: SocketSession, error: Error) {
        const logger = this.logger.createChildLogger({
            sessionId: session.id,
            traceId: generateTraceId(),
        });
        logger.error({
            message: 'Socket Error',
            error,
        });
        logger.debug({ message: error.stack ?? '' });
    }

    private handleSocketError(session: SocketSession, error: Error) {
        this.logSocketError(session, error);
        session.handleClose();
        this.handleSocketClose(session);
    }

    private startServerHeartbeat(session: SocketSession) {
        if (!appConfig.heartbeat.enable) {
            return EMPTY;
        }
        return this.rpcHandler.handleRequest(
            session,
            of({
                timestamp: new Date().toISOString(),
                payload: { type: EGeneralRouteName.ServerHeartbeat },
                traceId: generateTraceId(),
                correlationId: generateCorrelationId(),
                route: rootRpcRoutes[EGeneralRouteName.ServerHeartbeat],
            }),
        );
    }

    private handleSend<T extends TRpcRouteName>(
        session: TRpcSession,
        res: TRpcResponse,
        ctx?: RpcRequestContext<T>,
    ): Observable<void> {
        return session.send(res, ctx).pipe(
            mergeMap(() => {
                if (res.error?.code === ERpcErrorCode.UNAUTHENTICATED && !isNil(ctx)) {
                    return session.close(ctx);
                }
                return EMPTY;
            }),
        );
    }

    private validateRequest(
        data: WebSocket.Data,
        session: TRpcSession,
    ): Observable<TRpcRequest | void> {
        try {
            const req = JSON.parse(data.toString()) as Partial<TRpcRequest>;
            let errMessage: string = '';

            if (isNil(req.correlationId)) {
                errMessage = 'missing correlationId';
            }

            // Validate TRpcRequest fields
            if (isNil(req.traceId)) {
                errMessage = 'missing traceId';
            }

            if (isNil(req.timestamp)) {
                errMessage = 'missing timestamp';
            }

            if (isNil(req.payload) || !isObject(req.payload)) {
                errMessage = 'missing payload';
            }

            if (!isEmpty(errMessage)) {
                return this.handleSend(
                    session,
                    this.rpcHandler.createErrorResponse(
                        validationFailError(errMessage),
                        req.traceId ?? generateTraceId(),
                        req.correlationId ?? UNCAUGHT_ERROR_CORRELATION_ID,
                    ),
                );
            }

            return of(req as TRpcRequest);
        } catch (e) {
            throw requestParseError((e as Error).message);
        }
    }
}
