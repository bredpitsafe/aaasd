import type { TLoggerBasicMessage } from '@backend/utils/src/logger.ts';
import { createLogger } from '@backend/utils/src/logger.ts';

import { EActorName } from '../defs/actors.ts';
import { appConfig } from './appConfig.ts';

/**
 * @public
 */
export type TLoggerMessage = {
    actor: EActorName;
} & TLoggerBasicMessage;

export const defaultLogger = createLogger<TLoggerMessage>({
    loggingLevel: appConfig.logging.level,
    defaultLogActor: EActorName.Root,
    devMode: appConfig.service.env === 'dev',
});
