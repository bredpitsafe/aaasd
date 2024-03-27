import { TMetric } from '../../handlers/sendMetricsHandle';
import { EApplicationName } from '../../types/app';
import { TSocketURL } from '../../types/domain/sockets';
import { Milliseconds } from '../../types/time';
import { createActorEnvelopeBox } from '../../utils/Actors';
import { TThreadName } from '../../workers/defs';

export const collectResponseTimeEnvBox = createActorEnvelopeBox<{
    labels: [TSocketURL];
    observe: Milliseconds;
}>()('RESPONSE_TIME');

export const collectAppTimeToFrameEnvBox = createActorEnvelopeBox<{
    labels: [EApplicationName];
    observe: Milliseconds;
}>()('APP_FRAME_TIME');

export const collectMemoryUsageEnvBox = createActorEnvelopeBox<{
    labels: [TThreadName];
    observe: number;
}>()('MEMORY_USAGE');

export const collectClientErrorsEnvBox = createActorEnvelopeBox<{
    labels: [TThreadName];
}>()('CLIENT_ERRORS');

export const publishAllMetricsEnvBox = createActorEnvelopeBox<TMetric[]>()('PUBLISH_ALL_METRICS');
