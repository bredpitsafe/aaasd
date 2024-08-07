import type { EApplicationName, Milliseconds } from '@common/types';

import type { TPublishLog } from '../../modules/actions/logs/defs.ts';
import type { TMetric } from '../../modules/actions/metrics/defs.ts';
import type { TSocketURL } from '../../types/domain/sockets';
import { createActorEnvelopeBox } from '../../utils/Actors';

export const collectResponseTimeEnvBox = createActorEnvelopeBox<{
    labels: [TSocketURL];
    observe: Milliseconds;
}>()('RESPONSE_TIME');

export const collectAppTimeToFrameEnvBox = createActorEnvelopeBox<{
    labels: [EApplicationName];
    observe: Milliseconds;
}>()('APP_FRAME_TIME');

export const collectMemoryUsageEnvBox = createActorEnvelopeBox<{
    labels: [string];
    observe: number;
}>()('MEMORY_USAGE');

export const collectClientErrorsEnvBox = createActorEnvelopeBox<{
    labels: [string];
}>()('CLIENT_ERRORS');

export const tableStateStorageSizeEnvBox = createActorEnvelopeBox<{
    observe: number;
}>()('TABLE_STATE_SIZE');

export const publishAllMetricsEnvBox = createActorEnvelopeBox<TMetric[]>()('PUBLISH_ALL_METRICS');

export const sendMetricsEnvBox = createActorEnvelopeBox<TMetric[]>()('SEND_METRICS');

export const sendLogEnvBox = createActorEnvelopeBox<TPublishLog>({ useLogger: false })('SEND_LOG');
