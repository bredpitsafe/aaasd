import type { TDataSourceStateMap } from '../modules/dataSourceStatus/defs.ts';
import type { TSocketServerTimeMap } from '../modules/socketServerTime/defs.ts';
import { createActorEnvelopeBox } from '../utils/Actors';
import { createActorObservableBox } from '../utils/Actors/observable';
import type { TLogEventData } from '../utils/Tracing/def';

export const pullLogsEnvBox = createActorObservableBox<undefined, TLogEventData[]>()('PULL_LOGS');

export const setupFingerprintEnvBox = createActorEnvelopeBox<string>()('SETUP_FINGER_PRINT');

export const publishDataSourceStateEnvBox = createActorEnvelopeBox<TDataSourceStateMap>()(
    'PUBLISH_DATA_SOURCE_STATUS',
);

export const publishSocketServerTimeEnvBox = createActorEnvelopeBox<TSocketServerTimeMap>()(
    'PUBLISH_SOCKET_SERVER_TIME',
);
