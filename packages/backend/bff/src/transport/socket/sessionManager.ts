import { generateTraceId } from '@common/utils';
import type { WebSocket } from 'ws';

import { EActorName } from '../../def/actor.ts';
import { metrics } from '../../modules/metrics/service.ts';
import { defaultLogger } from '../../utils/logger.ts';
import type { TSessionId } from '../../utils/sessionId.ts';
import { createSessionId } from '../../utils/sessionId.ts';
import { SocketSession } from './session.ts';

export class SocketSessionManager {
    private socketSessionsMap = new Map<TSessionId, SocketSession>();
    private logger = defaultLogger.createChildLogger({ actor: EActorName.Socket });

    private get activeSockets() {
        return this.socketSessionsMap.size;
    }

    createSession = (ws: WebSocket): SocketSession => {
        const sessionId = createSessionId();
        const socketSession = new SocketSession(sessionId, ws);
        this.socketSessionsMap.set(sessionId, socketSession);

        metrics.socket.total.inc();
        metrics.socket.active.set(this.activeSockets);

        this.logger.info({
            message: 'Socket registered',
            traceId: generateTraceId(),
            sessionId: sessionId,
            activeSockets: this.activeSockets,
        });

        return socketSession;
    };

    delete = (sessionId: TSessionId) => {
        this.socketSessionsMap.delete(sessionId);
        metrics.socket.active.set(this.activeSockets);
        this.logger.info({
            message: 'Socket removed',
            traceId: generateTraceId(),
            activeSockets: this.activeSockets,
        });
    };

    getById = (sessionId: TSessionId) => {
        return this.socketSessionsMap.get(sessionId);
    };
}
