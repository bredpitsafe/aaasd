import { generateTraceId } from '@common/utils';
import { Server, ServerCredentials } from '@grpc/grpc-js';
import express from 'express';

import { initAllServices } from './services/index.ts';
import { appConfig } from './utils/appConfig.ts';
import { healthCheckHandler } from './utils/healthcheck.ts';
import { defaultLogger } from './utils/logger.ts';
import { metricsHandler } from './utils/metrics.ts';

const app = express();
app.get(appConfig.service.healthcheckURL, (_req, res) => {
    void healthCheckHandler(res);
});
app.get(appConfig.metrics.url, (_req, res) => {
    void metricsHandler(res);
});

app.listen(appConfig.service.httpPort, () => {
    const traceId = generateTraceId();

    defaultLogger.info({
        message: `HTTP server started, listening on port ${appConfig.service.httpPort}`,
        traceId,
    });

    // Create a gRPC server
    const server = new Server();
    initAllServices(server);

    server.bindAsync(
        `0.0.0.0:${appConfig.service.grpcPort}`,
        ServerCredentials.createInsecure(),
        (err, port) => {
            if (err) {
                defaultLogger.error({
                    message: 'failed to start GRPC server',
                    error: err,
                    traceId,
                });
            } else {
                defaultLogger.info({
                    message: `GRPC server started, listening on port ${port}`,
                    traceId,
                });
            }
        },
    );
});
