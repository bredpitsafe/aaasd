import { getAuthInterceptor } from '@backend/grpc/src/authInterceptor.ts';
import { healthcheckHandler } from '@backend/utils/src/healthcheck.ts';
import { metricsRouteHandler } from '@backend/utils/src/metrics.ts';
import { generateTraceId } from '@common/utils';
import { Server, ServerCredentials } from '@grpc/grpc-js';
import { services } from '@grpc-schemas/user_settings-api-sdk';
import express from 'express';

import { EActorName } from './defs/actors.ts';
import { repository } from './modules/db/repository.ts';
import { removeUserSettings } from './rpc/removeUserSettings.ts';
import { subscribeToUserSettings } from './rpc/subscribeToUserSettings.ts';
import { upsertUserSettings } from './rpc/upsertUserSettings.ts';
import { appConfig } from './utils/appConfig.ts';
import { defaultLogger } from './utils/logger.ts';
const { UserSettingsServiceService } = services.user_settings.v1;

const logger = defaultLogger.createChildLogger({
    actor: EActorName.Root,
    traceId: generateTraceId(),
});

const server = new Server({
    interceptors: [
        getAuthInterceptor((loggerMessage) =>
            logger.error({ actor: EActorName.AuthInterceptor, ...loggerMessage }),
        ),
    ],
});

server.addService(UserSettingsServiceService, {
    subscribeToUserSettings,
    upsertUserSettings,
    removeUserSettings,
});

const app = express();
app.get(appConfig.metrics.url, (_, res) => {
    void metricsRouteHandler(res, logger.createChildLogger({ actor: EActorName.Metrics }));
});

app.listen(appConfig.service.httpServerPort, () => {
    logger.info({
        message: `Http server for Metrics and Healthcheck running on http://0.0.0.0:${appConfig.service.httpServerPort}`,
    });
});

app.get(appConfig.service.httpHealthcheckURL, (_req, res) => {
    void healthcheckHandler(
        res,
        logger.createChildLogger({ actor: EActorName.Healthcheck }),
        async () => {
            await repository.healthcheck();
        },
    );
});

server.bindAsync(
    `${appConfig.service.host}:${appConfig.service.port}`,
    ServerCredentials.createInsecure(),
    (err, port) => {
        if (err) {
            logger.error({
                message: `GRPC server initialization error: ${err.message}`,
            });
            process.exit(1);
        } else {
            logger.info({
                message: `User settings service has started`,
                port,
            });
        }
    },
);

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
