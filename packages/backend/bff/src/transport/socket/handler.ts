import { generateCorrelationId } from '@backend/utils/src/correlationId.ts';
import { generateTraceId } from '@backend/utils/src/traceId/index.ts';
import { groupByWithCleanup } from '@common/rx';
import {
    catchError,
    EMPTY,
    fromEvent,
    identity,
    map,
    merge,
    mergeMap,
    NEVER,
    Observable,
    of,
    takeUntil,
    tap,
} from 'rxjs';
import WebSocket, { ErrorEvent, MessageEvent } from 'ws';

import { EActorName } from '../../def/actor.ts';
import { ERpcErrorCode, TRpcRequest } from '../../def/rpc.ts';
import { EGeneralRouteName } from '../../modules/root/def.ts';
import { TRpcResponseWithContext, TRpcSession } from '../../rpc/def.ts';
import { requestParseError } from '../../rpc/errors.ts';
import { RpcHandler } from '../../rpc/handler.ts';
import { appConfig } from '../../utils/appConfig.ts';
import { defaultLogger } from '../../utils/logger.ts';
import { SocketSession } from './session.ts';
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
            map(({ data }) => this.parseMessage(data)),
            groupByWithCleanup((req) => req.correlationId),
            mergeMap((reqFlow$) => this.rpcHandler.handleRequest(session, reqFlow$)),
        );

        const serverHeartbeat$ = this.startServerHeartbeat(session);

        return merge(socketMessage$, serverHeartbeat$).pipe(
            takeUntil(socketError$),
            takeUntil(socketClose$),
            mergeMap((data) => this.handleSend(session, data)),
            catchError((err: Error) => {
                // Upon receiving any unusual error here
                // We should log it and close the socket
                this.handleSocketError(session, err);
                socket.close();
                return NEVER;
            }),
        );
    };

    private handleSocketClose(session: SocketSession) {
        this.sessionManager.delete(session.id);
    }

    private handleSocketError(session: SocketSession, error: Error) {
        const logger = this.logger.createChildLogger({
            sessionId: session.id,
            traceId: generateTraceId(),
        });
        logger.error({
            message: 'Socket Error',
            error,
        });
        logger.debug({ message: error.stack ?? '' });
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
            }),
        );
    }

    private parseMessage(data: WebSocket.Data): TRpcRequest {
        try {
            return JSON.parse(data.toString()) as TRpcRequest;
        } catch (err) {
            throw requestParseError((err as Error).message);
        }
    }

    private handleSend(
        session: TRpcSession,
        { res, ctx }: TRpcResponseWithContext,
    ): Observable<void> {
        return session.send(res, ctx).pipe(
            mergeMap(() => {
                if (res.error?.code === ERpcErrorCode.UNAUTHENTICATED) {
                    return session.close(ctx);
                }
                return EMPTY;
            }),
        );
    }
}
