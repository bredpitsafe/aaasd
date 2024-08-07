import { generateTraceId } from '@common/utils';
import Bottleneck from 'bottleneck';

import { EActorName } from '../def/actor.ts';
import { config } from '../utils/config.ts';
import { defaultLogger } from '../utils/logger.ts';

export const queryLimiter = new Bottleneck({
    maxConcurrent: config.postgres.maxConcurrentQueries,
    highWater: config.postgres.maxQueueSize,
    strategy: Bottleneck.strategy.OVERFLOW,
});

queryLimiter.on('failed', function (error, jobInfo) {
    // This will be called every time a job fails.
    defaultLogger.error({
        actor: EActorName.Root,
        message: 'limiter job failed',
        traceId: generateTraceId(),
        error,
        jobInfo,
    });
});
