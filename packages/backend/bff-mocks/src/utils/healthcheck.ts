import { generateTraceId } from '@common/utils';
import type { Response } from 'express';

import { EActorName } from '../def/actor.ts';
import { defaultLogger } from './logger.ts';

export const healthCheckHandler = async (res: Response) => {
    try {
        // TODO: Add some actual checks
        res.status(200).send('Ok.');
        defaultLogger.info({
            message: 'Healthcheck request processed - ok',
            actor: EActorName.Root,
            traceId: generateTraceId(),
        });
    } catch (err) {
        defaultLogger.error({
            message: 'Healthcheck request error',
            actor: EActorName.Root,
            traceId: generateTraceId(),
            error: (err as Error)?.message,
        });
        res.status(500).send('Healthcheck failed');
    }
};
