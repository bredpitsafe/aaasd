import { TSession } from '../modules/session';
import { createActorEnvelopeBox } from '../utils/Actors';
import { createActorRequestBox } from '../utils/Actors/request';
import { TLogEventData } from '../utils/Tracing/def';

export const pullLogsEnvBox = createActorRequestBox<undefined, TLogEventData[]>()('PULL_LOGS');

export const setupFingerprintEnvBox = createActorEnvelopeBox<string>()('SETUP_FINGER_PRINT');

export const sendTokenEnvBox = createActorEnvelopeBox<string | null>()('SEND_TOKEN');
export const sendSessionEnvBox = createActorEnvelopeBox<TSession>()('SEND_SESSION');

export const requestLoginEnvBox = createActorEnvelopeBox<undefined>()('REQUEST_LOGIN');
