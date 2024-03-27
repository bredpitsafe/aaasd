import { TCorrelationId } from '@backend/utils/src/correlationId.ts';
import { createLogger, TBasicLogger, TLoggerBasicMessage } from '@backend/utils/src/logger.ts';

import { EActorName } from '../def/actor.ts';
import { TUserName } from '../def/user.ts';
import { appConfig } from './appConfig.ts';
import { TSessionId } from './sessionId.ts';

/**
 * @public
 */
export type TLoggerMessage = {
    actor: EActorName;
    correlationId?: TCorrelationId;
    sessionId?: TSessionId;
    username?: TUserName;
} & TLoggerBasicMessage;

export const defaultLogger = createLogger<TLoggerMessage>({
    loggingLevel: appConfig.logging.level,
    defaultLogActor: EActorName.Root,
    devMode: appConfig.service.stage === 'dev',
});

export type TChildLogger<DefaultedMessageParamKeys extends keyof TLoggerMessage> = TBasicLogger<
    TLoggerMessage,
    DefaultedMessageParamKeys
>;
