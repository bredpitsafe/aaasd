import { CorrelationId } from '../traceId/index.ts';

export function generateCorrelationId(): CorrelationId {
    return Math.floor(Math.random() * 10000000) as CorrelationId;
}
