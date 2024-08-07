import type { Response } from 'express';

import type { TBasicLogger, TLoggerBasicMessage } from './logger';

enum EActorName {
    Healthcheck = 'Healthcheck',
}

export const healthcheckHandler = async (
    res: Response,
    logger: TBasicLogger<TLoggerBasicMessage & { actor: EActorName }, 'actor' | 'traceId'>,
    checkModulesHealth: () => Promise<void>,
) => {
    try {
        await checkModulesHealth();

        res.status(200).send('Ok.');
        logger.info({
            message: 'Healthcheck request processed - ok',
        });
    } catch (error) {
        logger.error({
            message: 'Healthcheck request error',
            error: (error as Error)?.message,
        });
        logger.debug({ message: (error as Error).stack ?? '' });
        res.status(500).send('Healthcheck failed');
    }
};
