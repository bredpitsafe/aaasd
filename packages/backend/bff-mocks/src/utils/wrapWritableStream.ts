import type { TraceId } from '@common/utils';
import { generateTraceId } from '@common/utils';
import type { ServerWritableStream } from '@grpc/grpc-js';

import type { EActorName } from '../def/actor.ts';
import { defaultLogger } from './logger.ts';
import { metrics } from './metrics.ts';
import { sliceLogResponseData } from './sliceLogResponseData.ts';

const TRACE_ID_HEADER = 'X-B3-TraceId';

export const wrapWritableStream = <Req, Res>(
    actor: EActorName,
    endpointName: string,
    call: ServerWritableStream<Req, Res>,
): ServerWritableStream<Req, Res> => {
    const traceId = (call.metadata.get(TRACE_ID_HEADER)[0] as TraceId) ?? generateTraceId();

    defaultLogger.info({
        message: 'new subscription stream',
        actor,
        endpointName,
        endpointParams: call.request,
        traceId,
    });

    metrics.subscriptions.total.inc({ endpoint: endpointName });
    metrics.subscriptions.active.inc({ endpoint: endpointName });

    call.on('error', (error) => {
        defaultLogger.info({
            message: 'subscription stream error',
            actor,
            endpointName,
            error,
            traceId,
        });

        metrics.subscriptions.errors.inc({ endpoint: endpointName });
    });

    call.on('close', () => {
        defaultLogger.info({
            message: 'subscription stream closed',
            actor,
            endpointName,
            traceId,
        });

        metrics.subscriptions.active.dec({ endpoint: endpointName });
    });

    const origWrite = call.write.bind(call);
    call.write = (...args: Parameters<typeof call.write>) => {
        defaultLogger.info({
            message: 'response stream write',
            actor,
            endpointName,
            data: sliceLogResponseData(args[0]),
            traceId,
        });

        metrics.subscriptions.messages.inc({ endpoint: endpointName });
        return origWrite(...args);
    };

    return call;
};
