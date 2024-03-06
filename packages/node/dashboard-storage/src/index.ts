import express from 'express';
import ws from 'express-ws';
import type WebSocket from 'ws';

import { EActorName } from './def/actor.ts';
import { handleClose, handleMessage, registerSocket } from './modules/socket/index.ts';
import { config } from './utils/config.ts';
import { healthCheckHandler } from './utils/healthcheck.ts';
import { logger } from './utils/logger.ts';
import { metricsHandler } from './utils/metrics.ts';
import { generateTraceId } from './utils/traceId/index.ts';

const app = express();
const wsApp = ws(app);

wsApp.app.ws(config.service.url, (ws: WebSocket) => {
    const socketKey = registerSocket(ws);
    ws.onmessage = ({ data }) => {
        handleMessage(socketKey, data);
    };
    ws.onclose = () => handleClose(socketKey);
});

app.get(config.service.healthcheckURL, (_req, res) => {
    void healthCheckHandler(res);
});

app.get(config.metrics.url, (_req, res) => {
    void metricsHandler(res);
});

app.listen(config.service.port, () => {
    const traceId = generateTraceId();
    logger.info({
        message: 'Dashboards service has started',
        actor: EActorName.Root,
        traceId,
        port: config.service.port,
    });

    logger.debug({
        message: 'Service startup configuration',
        actor: EActorName.Root,
        traceId,
        config,
    });
});

process.on('uncaughtException', (error) => {
    logger.error({
        actor: EActorName.Root,
        message: 'Uncaught exception',
        traceId: generateTraceId(),
        error,
    });
    process.exit(1);
});
process.on('unhandledRejection', (reason) => {
    logger.error({
        actor: EActorName.Root,
        message: 'Unhandled rejection',
        traceId: generateTraceId(),
        reason,
    });
});
