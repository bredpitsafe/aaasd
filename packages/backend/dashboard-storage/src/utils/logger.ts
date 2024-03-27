import { TCorrelationId } from '@backend/utils/src/correlationId.ts';
import { createLogger, TLoggerBasicMessage } from '@backend/utils/src/logger.ts';

import { EActorName, TActorSocketKey } from '../def/actor.ts';
import { config } from './config.ts';

/**
 * @public
 */
export type TLoggerMessage = {
    actor: EActorName;
    correlationId?: TCorrelationId;
    socketKey?: TActorSocketKey;
} & TLoggerBasicMessage;

export const logger = createLogger({
    defaultLogActor: EActorName.Root,
    loggingLevel: config.logging.level,
});
