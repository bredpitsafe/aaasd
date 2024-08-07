import type { TLoggerBasicMessage } from '@backend/utils/src/logger.ts';
import { createLogger } from '@backend/utils/src/logger.ts';

import { EActorName } from '../def/actor.ts';
import { config } from './config.ts';

/**
 * @public
 */
export type TLoggerMessage = {
    actor: EActorName;
} & TLoggerBasicMessage;

export const defaultLogger = createLogger({
    defaultLogActor: EActorName.Root,
    loggingLevel: config.logging.level,
});
