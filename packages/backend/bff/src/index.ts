import 'reflect-metadata';

import { generateTraceId } from '@common/utils';
import bodyParser from 'body-parser';
import express from 'express';
import { createServer } from 'http';
import { createServer as createSecureServer } from 'https';
import { WebSocketServer } from 'ws';

import { EActorName } from './def/actor.ts';
import { httpRoutes, rpcRoutes } from './modules/routes.ts';
import { RpcHandler } from './rpc/handler.ts';
import { HttpHandler } from './transport/http/handler.ts';
import { SocketHandler } from './transport/socket/handler.ts';
import { appConfig, validateAppConfig } from './utils/appConfig.ts';
import { cert } from './utils/https.ts';
import { initializeKeycloakClient } from './utils/keycloak.ts';
import { defaultLogger } from './utils/logger.ts';

const logger = defaultLogger.createChildLogger({
    actor: EActorName.Root,
    traceId: generateTraceId(),
});

async function main() {
    logger.debug({
        message: 'startup configuration',
        config: appConfig,
    });
    logger.debug({
        message: 'env config',
        env: JSON.stringify(process.env),
    });

    logger.info({
        message: 'service env',
        stage: appConfig.service.env,
    });

    try {
        validateAppConfig();
    } catch (err) {
        if (err instanceof Error) {
            logger.error({
                message: err.message,
                stack: err.stack,
            });
            logger.debug({
                message: 'startup configuration',
                config: appConfig,
            });

            process.exit(1);
        }
        throw err;
    }
    logger.info({
        message: 'supported services',
        services: Object.keys(appConfig.resources.grpc.services),
    });
    logger.info({
        message: 'supported stages',
        stages: Object.keys(appConfig.stages),
    });

    initializeKeycloakClient();

    const socketHandler = new SocketHandler(new RpcHandler(rpcRoutes));
    const httpHandler = new HttpHandler(httpRoutes);

    const app = express();
    app.use(bodyParser.json({ type: 'application/json' }));
    app.use(bodyParser.json({ type: 'application/csp-report' }));

    // Create self-hosted secure server when running BFF outside of container (mostly, on localhost).
    // to allow connecting to it directly from `https://localhost` frontend apps.
    // When running in Docker container, HTTPS/WSS will be provided by the proxy server
    // outside application container (e.g. nginx as reverse proxy).
    const server = appConfig.service.secure ? createSecureServer(cert, app) : createServer(app);

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
