import { getAuthInterceptor } from '@backend/grpc/src/authInterceptor.ts';
import { healthcheckHandler } from '@backend/utils/src/healthcheck.ts';
import { metricsRouteHandler } from '@backend/utils/src/metrics.ts';
import { generateTraceId } from '@common/utils';
import { Server, ServerCredentials } from '@grpc/grpc-js';
import { services } from '@grpc-schemas/dashboard_storage-api-sdk';
import express from 'express';

import { checkDatabaseConnection } from './db/system.ts';
import { EActorName } from './def/actor.ts';
import { createDashboard } from './modules/dashboards/createDashboard.ts';
import { deleteDashboard } from './modules/dashboards/deleteDashboard.ts';
import { fetchDashboardConfig } from './modules/dashboards/fetchDashboardConfig.ts';
import { importDashboard } from './modules/dashboards/importDashboard.ts';
import { renameDashboard } from './modules/dashboards/renameDashboard.ts';
import { subscribeToDashboard } from './modules/dashboards/subscribeToDashboard.ts';
import { subscribeToDashboardList } from './modules/dashboards/subscribeToDashboardList.ts';
import { fetchDashboardDraftConfig } from './modules/drafts/fetchDashboardDraftConfig.ts';
import { resetDashboardDraftConfig } from './modules/drafts/resetDashboardDraftConfig.ts';
import { submitDashboardDraftConfig } from './modules/drafts/submitDashboardDraftConfig.ts';
import { updateDashboardDraftConfig } from './modules/drafts/updateDashboardDraftConfig.ts';
import { subscribeToDashboardPermissions } from './modules/permissions/subscribeToDashboardPermissions.ts';
import { updateDashboardPermissions } from './modules/permissions/updateDashboardPermissions.ts';
import { updateDashboardShareSettings } from './modules/permissions/updateDashboardShareSettings.ts';
import { updateDashboardScopeBinding } from './modules/scopes/index.ts';
import { config } from './utils/config.ts';
import { defaultLogger } from './utils/logger.ts';
import { initializeMetricsCollect } from './utils/metrics.ts';
const { DashboardServiceService, DashboardDraftServiceService, DashboardSharingServiceService } =
    services.dashboard_storage.v1;

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

server.addService(DashboardServiceService, {
    createDashboard,
    importDashboard,
    deleteDashboard,
    renameDashboard,
    updateDashboardScopeBinding,
    fetchDashboardConfig,
    subscribeToDashboard,
    subscribeToDashboardList,
});

server.addService(DashboardDraftServiceService, {
    fetchDashboardDraftConfig,
    updateDashboardDraftConfig,
    submitDashboardDraftConfig,
    resetDashboardDraftConfig,
});

server.addService(DashboardSharingServiceService, {
    updateDashboardPermissions,
    updateDashboardShareSettings,
    subscribeToDashboardPermissions,
});

const app = express();
app.get(config.metrics.url, (_, res) => {
    void metricsRouteHandler(res, logger.createChildLogger({ actor: EActorName.Metrics }));
});

app.listen(config.service.httpServerPort, () => {
    logger.info({
        message: `Http server for Metrics and Healthcheck running on http://0.0.0.0:${config.service.httpServerPort}`,
    });
});

app.get(config.service.httpHealthcheckURL, (_req, res) => {
    void healthcheckHandler(
        res,
        logger.createChildLogger({ actor: EActorName.Healthcheck }),
        async () => {
            await checkDatabaseConnection();
        },
    );
});

server.bindAsync(
    `${config.service.host}:${config.service.port}`,
    ServerCredentials.createInsecure(),
    (err, port) => {
        if (err) {
            logger.error({
                message: `GRPC server initialization error: ${err.message}`,
            });
            process.exit(1);
        } else {
            initializeMetricsCollect();

            logger.info({
                message: 'Metrics collect initialized',
                actor: EActorName.Root,
            });

            logger.info({
                message: `Dashboards storage service has started`,
                port,
            });

            logger.debug({
                message: 'Service startup configuration',
                actor: EActorName.Root,
                config,
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
