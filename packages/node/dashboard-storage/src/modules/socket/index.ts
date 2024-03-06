import { isEmpty, isNil, omit } from 'lodash-es';
import type WebSocket from 'ws';

import { EActorName, TActorRequest, TActorSocketKey } from '../../def/actor.ts';
import type { Request } from '../../def/request.ts';
import { ResponseState } from '../../def/response.ts';
import { createActorSocketKey } from '../../utils/actors.ts';
import { config } from '../../utils/config.ts';
import { generateCorrelationId } from '../../utils/correlationId/index.ts';
import { EActorErrorKind } from '../../utils/errors.ts';
import { logger } from '../../utils/logger.ts';
import { metrics } from '../../utils/metrics.ts';
import { validateRequestSchema } from '../../utils/schema.ts';
import { CorrelationId, generateTraceId, TraceId } from '../../utils/traceId/index.ts';
import { deauthenticateSocket, getUserName } from '../authentication/index.ts';
import { runSubscription, unsubscribeSocket } from '../subscription/index.ts';
import { TCloseParams, TSendParams } from './def.ts';

const wsMap = new Map<TActorSocketKey, WebSocket>();

export const registerSocket = (socket: WebSocket) => {
    const socketKey = createActorSocketKey();
    wsMap.set(socketKey, socket);
    const activeSockets = wsMap.size;
    metrics.socket.total.inc();
    metrics.socket.active.set(activeSockets);
    logger.info({
        message: 'Socket registered',
        actor: EActorName.Socket,
        traceId: generateTraceId(),
        socketKey,
        activeSockets,
    });

    if (config.heartbeat.enable) {
        runSubscription(
            {
                socketKey,
                username: getUserName(socketKey),
                traceId: generateTraceId(),
                correlationId: generateCorrelationId(),
                payload: {
                    type: 'ServerHeartbeat',
                },
            },
            send,
            close,
        );
    }

    return socketKey;
};

const send = (params: TSendParams) => {
    const response = {
        timestamp: new Date().toISOString(),
        ...omit(params, 'socketKey'),
    };
    const ws = wsMap.get(params.socketKey);
    const payloadStr = JSON.stringify(response);
    logger.debug({
        message: 'sending payload',
        actor: EActorName.Socket,
        traceId: params.traceId as TraceId,
        correlationId: params.correlationId as CorrelationId,
        length: payloadStr.length,
        socketKey: params.socketKey,
    });

    if (isNil(ws)) {
        logger.error({
            actor: EActorName.Socket,
            message: 'Socket not found by socketKey',
            traceId: params.traceId as TraceId,
            correlationId: params.correlationId as CorrelationId,
            socketKey: params.socketKey,
        });
        return;
    }

    ws.send(payloadStr);
};

const close = (params: TCloseParams) => {
    const ws = wsMap.get(params.socketKey);
    logger.debug({
        message: 'closing socket by internal command',
        actor: EActorName.Socket,
        traceId: params.traceId as TraceId,
        correlationId: params.correlationId as CorrelationId,
        socketKey: params.socketKey,
    });

    if (isNil(ws)) {
        logger.error({
            actor: EActorName.Socket,
            message: 'Socket not found by socketKey',
            traceId: params.traceId as TraceId,
            correlationId: params.correlationId as CorrelationId,
            socketKey: params.socketKey,
        });
        return;
    }

    ws.close();
};

const deleteSocket = (socketKey: TActorSocketKey) => {
    wsMap.delete(socketKey);
    const activeSockets = wsMap.size;
    metrics.socket.active.set(activeSockets);
    logger.info({
        message: 'Socket removed',
        actor: EActorName.Socket,
        traceId: generateTraceId(),
        activeSockets,
    });
};

export const handleMessage = (socketKey: TActorSocketKey, data: WebSocket.Data) => {
    try {
        const req = JSON.parse(data.toString()) as Request;
        logger.debug({
            message: 'Received socket message',
            actor: EActorName.Socket,
            traceId: (req.traceId as TraceId) ?? generateTraceId(),
        });

        const { errors } = validateRequestSchema(req);
        if (!isEmpty(errors)) {
            metrics.socket.schemaValidationErrors.inc();

            send({
                socketKey,
                traceId: req.traceId,
                correlationId: req.correlationId,
                state: ResponseState.Done,
                error: {
                    kind: EActorErrorKind.Validation,
                    description:
                        'Request validation error: request body is missing required fields since it does not match any request schema.',
                },
            });
            return;
        }

        const actorRequest: TActorRequest = {
            username: getUserName(socketKey),
            socketKey,
            traceId: req.traceId as TraceId,
            correlationId: req.correlationId as CorrelationId,
            payload: req.payload,
        };

        runSubscription(actorRequest, send, close);
    } catch (err) {
        const message = (err as Error)?.message;
        logger.error({
            message: 'failed to process socket message',
            actor: EActorName.Socket,
            traceId: generateTraceId(),
            error: message,
        });
        metrics.socket.internalErrors.inc();
        send({
            socketKey,
            state: ResponseState.Done,
            error: {
                kind: EActorErrorKind.InternalError,
                description:
                    'Request processing error. internal error occurred while processing the request. Please file a bug report and provide client logs.',
                args: {
                    originalError: (err as Error)?.message,
                },
            },
        });
    }
};

export const handleClose = (socketKey: TActorSocketKey) => {
    // Remove authentication state cache for this socket
    deauthenticateSocket(socketKey);
    // Stop and remove all pending subscriptions for this socket
    unsubscribeSocket(socketKey);
    // Delete socket from active sockets list
    deleteSocket(socketKey);
};
