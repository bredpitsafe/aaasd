import { generateTraceId } from '@common/utils';
import type { RequestHandler } from 'express';
import { omit } from 'lodash-es';

import { EActorName } from '../../def/actor.ts';
import { defaultLogger } from '../../utils/logger.ts';
import type { TPublishLog } from './defs.ts';
import { toLoggerMethod } from './utils.ts';

/**
 * @public
 */
export type TSendLogsRequestPayload = {
    fingerprint: string;
    logs: TPublishLog[];
};
/**
 * @public
 */
export type TSendLogsResponsePayload = {};

const MAX_LOGS_PER_MINUTE = 10_000;
const RATE_LIMIT_WINDOW = 60_000;
const OLD_RATE_LIMIT_STATES_DISPOSE_INTERVAL = 120_000;

const rateLimitStatesMap = new Map<
    TSendLogsRequestPayload['fingerprint'],
    { currentLogsCountWithinWindow: number; windowStartTime: number }
>();

setInterval(function disposeOldStates() {
    const currentTime = Date.now();
    rateLimitStatesMap.forEach((state, fingerprint) => {
        if (currentTime - state.windowStartTime > RATE_LIMIT_WINDOW) {
            rateLimitStatesMap.delete(fingerprint);
        }
    });
}, OLD_RATE_LIMIT_STATES_DISPOSE_INTERVAL);

export const sendLogsHandlers: RequestHandler<
    {},
    TSendLogsResponsePayload,
    TSendLogsRequestPayload
>[] = [
    function rateLimiterMiddleware(req, res, next) {
        const { fingerprint, logs } = req.body;
        const currentTime = Date.now();
        const rateLimitState = rateLimitStatesMap.get(fingerprint);

        if (logs.length > MAX_LOGS_PER_MINUTE) {
            return res.status(429).send('Rate limit exceeded');
        }

        if (rateLimitState) {
            if (currentTime - rateLimitState.windowStartTime < RATE_LIMIT_WINDOW) {
                if (
                    rateLimitState.currentLogsCountWithinWindow + logs.length >
                    MAX_LOGS_PER_MINUTE
                ) {
                    return res.status(429).send('Rate limit exceeded');
                }

                rateLimitState.currentLogsCountWithinWindow += logs.length;
            } else {
                rateLimitState.currentLogsCountWithinWindow = logs.length;
                rateLimitState.windowStartTime = currentTime;
            }
        } else {
            rateLimitStatesMap.set(fingerprint, {
                currentLogsCountWithinWindow: logs.length,
                windowStartTime: currentTime,
            });
        }

        next();
    },
    async (req, res) => {
        const logger = defaultLogger.createChildLogger({
            // TODO: Check. Is this actor_group in Loki?
            actor: EActorName.Frontend,
            traceId: generateTraceId(),
        });

        const logs = req.body.logs;
        logs.forEach((log) => {
            logger[toLoggerMethod(log.level)](omit(log, 'level'));
        });

        res.send();
    },
];
