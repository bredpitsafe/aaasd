import 'reflect-metadata';

import { generateTraceId } from '@backend/utils/src/traceId/index.ts';
import express from 'express';
import { createServer } from 'http';
import { createServer as createSecureServer } from 'https';
import { WebSocketServer } from 'ws';

import { EActorName } from './def/actor.ts';
import { httpRoutes, rpcRoutes } from './modules/routes.ts';
import { RpcHandler } from './rpc/handler.ts';
import { HttpHandler } from './transport/http/handler.ts';
import { SocketHandler } from './transport/socket/handler.ts';
import { appConfig } from './utils/appConfig.ts';
import { cert } from './utils/https.ts';
import { defaultLogger } from './utils/logger.ts';

const logger = defaultLogger.createChildLogger({
    actor: EActorName.Root,
    traceId: generateTraceId(),
});

async function main() {
    const socketHandler = new SocketHandler(new RpcHandler(rpcRoutes));
    const httpHandler = new HttpHandler(httpRoutes);

    const app = express();
    // Create self-hosted secure server in `development` mode
    // to allow connecting to it directly from `https://localhost` frontend apps.
    // When in `production` mode, HTTPS/WSS will be provided by the proxy server
    // outside application container (e.g. nginx as reverse proxy).
    const server =
        appConfig.service.stage === 'dev' ? createSecureServer(cert, app) : createServer(app);

    new WebSocketServer({ server }).on('connection', (ws) => {
        logger.debug({ message: 'New socket connection established' });
        void socketHandler.handleSocketConnect(ws).subscribe();
    });

    app.use(httpHandler.getRouter());

    server.listen(appConfig.service.port, () => {
        logger.info({
            message: 'BFF service has started',
            port: appConfig.service.port,
        });

        logger.debug({
            message: 'Service startup configuration',
            config: appConfig,
        });
    });
}

void main();

process.on('uncaughtException', (error: Error) => {
    logger.error({
        message: `Uncaught exception: ${error.message}`,
        error,
    });
    logger.debug({ message: error.stack ?? '' });
    process.exit(1);
});

process.on('unhandledRejection', (reason: string) => {
    throw new Error(reason);
});
