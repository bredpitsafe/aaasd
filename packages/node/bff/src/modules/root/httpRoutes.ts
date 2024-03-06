import { EActorName } from '../../def/actor.ts';
import { EHttpMethod, EHttpRouteName } from '../../transport/http/def.ts';
import { createHttpRoutes } from '../../transport/http/utils.ts';
import { appConfig } from '../../utils/appConfig.ts';
import { keycloak } from '../../utils/keycloak.ts';
import { defaultLogger } from '../../utils/logger.ts';
import { generateTraceId } from '../../utils/traceId.ts';

export const rootHttpRoutes = createHttpRoutes({
    [EHttpRouteName.HealthCheck]: {
        method: EHttpMethod.GET,
        path: appConfig.service.healthcheckURL,
        async handler(_req, res) {
            const logger = defaultLogger.child({
                actor: EActorName.Root,
                traceId: generateTraceId(),
            });

            try {
                // Check Oauth connection
                await keycloak;
                res.status(200).send('Ok.');
                logger.info({ message: 'Healthcheck request processed - ok' });
            } catch (error) {
                logger.error({ message: 'Healthcheck request error', error });
                logger.debug({ message: (error as Error).stack ?? '' });
                res.status(500).send('Healthcheck failed');
            }
        },
    },
});
