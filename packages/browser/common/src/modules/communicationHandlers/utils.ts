import { TEnvelope, TSendEnvelope, TSendPayload, WithPayload } from '../../lib/BFFSocket/def';
import { getRandomUint32 } from '../../utils/random';
import { getNowISO } from '../../utils/time';
import { generateTraceId, TraceId } from '../../utils/traceId';

export function prepareEnvelopeToTracing(
    envelope: TEnvelope<WithPayload<unknown>>,
): TEnvelope<WithPayload<undefined>> {
    return {
        ...envelope,
        payload: undefined,
    };
}

export function createEnvelope<P extends TSendPayload>(
    payload: P,
    traceId?: TraceId,
    correlationId?: number,
): TSendEnvelope<P> {
    return {
        payload,
        traceId: traceId ?? generateTraceId(),
        correlationId: correlationId ?? generateCorrelationId(),
        timestamp: getNowISO(),
    };
}

export function generateCorrelationId(): number {
    return getRandomUint32();
}
