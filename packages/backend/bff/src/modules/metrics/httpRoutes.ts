import { generateTraceId } from '@common/utils';
import { register } from 'prom-client';

import { EActorName } from '../../def/actor.ts';
import { EHttpMethod, EHttpRouteName } from '../../transport/http/def.ts';
import { createHttpRoutes } from '../../transport/http/utils.ts';
import { appConfig } from '../../utils/appConfig.ts';
import { defaultLogger } from '../../utils/logger.ts';

export const metricsHttpRoutes = createHttpRoutes({
    [EHttpRouteName.GetMetrics]: {
        path: appConfig.metrics.url,
        method: EHttpMethod.GET,
        async handler(_req, res) {
            const logger = defaultLogger.createChildLogger({
                actor: EActorName.Metrics,
                traceId: generateTraceId(),
            });
            try {
                const metrics = await register.metrics();
                res.setHeader('Content-Type', register.contentType);
                res.send(metrics);
                logger.info({
                    message: 'Metrics request processed',
                    metricsSize: metrics.length,
                });
            } catch (error) {
                logger.error({
                    message: 'Metrics request error',
                    error,
                });
                logger.debug({ message: (error as Error).stack ?? '' });
                res.status(500).send('Metrics internal error');
            }
        },
    },
});
