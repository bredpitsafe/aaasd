import { generateTraceId } from '@backend/utils/src/traceId/index.ts';
import { Response } from 'express';

import { checkDatabaseConnection } from '../db/system.ts';
import { EActorName } from '../def/actor.ts';
import { keycloak } from './keycloak.ts';
import { logger } from './logger.ts';

export const healthCheckHandler = async (res: Response) => {
    try {
        // Check DB connection
        await checkDatabaseConnection();
        // Check Oauth connection
        await keycloak;
        res.status(200).send('Ok.');
        logger.info({
            message: 'Healthcheck request processed - ok',
            actor: EActorName.Root,
            traceId: generateTraceId(),
        });
    } catch (err) {
        logger.error({
            message: 'Healthcheck request error',
            actor: EActorName.Root,
            traceId: generateTraceId(),
            error: (err as Error)?.message,
        });
        res.status(500).send('Healthcheck failed');
    }
};
