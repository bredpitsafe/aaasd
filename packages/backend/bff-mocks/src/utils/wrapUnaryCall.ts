import type { TraceId } from '@common/utils';
import { generateTraceId } from '@common/utils';
import type { sendUnaryData, ServerUnaryCall } from '@grpc/grpc-js';

import type { EActorName } from '../def/actor.ts';
import { defaultLogger } from './logger.ts';
import { metrics } from './metrics.ts';
import { sliceLogResponseData } from './sliceLogResponseData.ts';

const TRACE_ID_HEADER = 'X-B3-TraceId';

export const wrapUnaryCall = <Req, Res>(
    actor: EActorName,
    endpointName: string,
    call: ServerUnaryCall<Req, Res>,
    callback: sendUnaryData<Res>,
): sendUnaryData<Res> => {
    const traceId = (call.metadata.get(TRACE_ID_HEADER)[0] as TraceId) ?? generateTraceId();

    defaultLogger.info({
        message: 'new request',
        actor,
        endpointName,
        endpointParams: call.request,
        traceId,
    });

    metrics.subscriptions.total.inc({ endpoint: endpointName });
    metrics.subscriptions.active.inc({ endpoint: endpointName });

    call.on('error', (error) => {
        defaultLogger.info({
            message: 'request error',
            actor,
            endpointName,
            error,
            traceId,
        });
        metrics.subscriptions.errors.inc({ endpoint: endpointName });
    });

    call.on('close', () => {
        defaultLogger.info({
            message: 'request closed',
            actor,
            endpointName,
            traceId,
        });

        metrics.subscriptions.active.dec({ endpoint: endpointName });
    });

    const newCallback: sendUnaryData<Res> = (...args) => {
        defaultLogger.info({
            message: 'response sent',
            actor,
            endpointName,
            data: sliceLogResponseData(args[1]),
            traceId,
        });

        callback(...args);
        metrics.subscriptions.messages.inc({ endpoint: endpointName });
    };

    return newCallback;
};
