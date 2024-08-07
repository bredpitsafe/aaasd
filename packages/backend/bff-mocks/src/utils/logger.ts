import type { TBasicLogger, TLoggerBasicMessage } from '@backend/utils/src/logger.ts';
import { createLogger } from '@backend/utils/src/logger.ts';

import { EActorName } from '../def/actor.ts';
import { appConfig } from './appConfig.ts';

/**
 * @public
 */
export type TLoggerMessage = TLoggerBasicMessage;

export const defaultLogger = createLogger<TLoggerMessage>({
    loggingLevel: appConfig.logging.level,
    defaultLogActor: EActorName.Root,
    devMode: process.env.NODE_ENV !== 'production',
});

/**
 * @public
 */
export type TChildLogger<DefaultedMessageParamKeys extends keyof TLoggerMessage> = TBasicLogger<
    TLoggerMessage,
    DefaultedMessageParamKeys
>;
