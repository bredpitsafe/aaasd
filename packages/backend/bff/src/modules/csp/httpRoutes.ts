import { generateTraceId } from '@common/utils';

import { EActorName } from '../../def/actor.ts';
import { EHttpMethod, EHttpRouteName } from '../../transport/http/def.ts';
import { createHttpRoutes } from '../../transport/http/utils.ts';
import { appConfig } from '../../utils/appConfig.ts';
import { defaultLogger } from '../../utils/logger.ts';

export const cspHttpRoutes = createHttpRoutes({
    [EHttpRouteName.CspReport]: {
        path: appConfig.csp.url,
        method: EHttpMethod.POST,
        async handler(req, res) {
            const logger = defaultLogger.createChildLogger({
                actor: EActorName.CSP,
                traceId: generateTraceId(),
            });
            logger.warn({ message: 'report', body: req.body });
            res.status(204).end();
        },
    },
});
