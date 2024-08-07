import type { TCorrelationId } from '@backend/utils/src/correlationId.ts';
import type { TBasicLogger, TLoggerBasicMessage } from '@backend/utils/src/logger.ts';
import { createLogger } from '@backend/utils/src/logger.ts';
import { EAppEnv } from '@common/types';

import { EActorName } from '../def/actor.ts';
import type { TUserName } from '../def/user.ts';
import { appConfig } from './appConfig.ts';
import type { TSessionId } from './sessionId.ts';

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
    devMode: appConfig.service.env === EAppEnv.Dev,
});

export type TChildLogger<DefaultedMessageParamKeys extends keyof TLoggerMessage> = TBasicLogger<
    TLoggerMessage,
    DefaultedMessageParamKeys
>;
