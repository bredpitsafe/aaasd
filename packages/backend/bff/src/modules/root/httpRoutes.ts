import { healthcheckHandler } from '@backend/utils/src/healthcheck.ts';
import { generateTraceId } from '@common/utils';

import { EActorName } from '../../def/actor.ts';
import { EHttpMethod, EHttpRouteName } from '../../transport/http/def.ts';
import { createHttpRoutes } from '../../transport/http/utils.ts';
import { appConfig } from '../../utils/appConfig.ts';
import { keycloak } from '../../utils/keycloak.ts';
import { defaultLogger } from '../../utils/logger.ts';

export const rootHttpRoutes = createHttpRoutes({
    [EHttpRouteName.HealthCheck]: {
        method: EHttpMethod.GET,
        path: appConfig.service.healthcheckURL,
        async handler(_req, res) {
            const logger = defaultLogger.createChildLogger({
                actor: EActorName.Healthcheck,
                traceId: generateTraceId(),
            });

            healthcheckHandler(res, logger, async () => {
                // Check Oauth connection
                await keycloak;
            });
        },
    },
});
