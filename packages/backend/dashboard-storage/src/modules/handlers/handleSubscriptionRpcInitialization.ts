import { extractTraceId, extractUsername } from '@backend/grpc/src/utils/metadata-utils.ts';
import { embedContextToMessage, generateTraceId } from '@common/utils';
import type { Metadata, ServerWritableStream } from '@grpc/grpc-js';
import { once } from 'lodash-es';
import type { Observable } from 'rxjs';
import { finalize, first, fromEvent, takeUntil } from 'rxjs';

import type { EActorName } from '../../def/actor.ts';
import { EMetricsLabel } from '../../def/metrics.ts';
import { convertToGrpcError } from '../../utils/errors.ts';
import { defaultLogger } from '../../utils/logger.ts';
import { metrics } from '../../utils/metrics.ts';

export const handleSubscriptionRpcInitialization = <TRequest, TResponse>({
    rpc,
    call,
    metadata,
    actor,
}: {
    rpc: Function;
    call: ServerWritableStream<TRequest, TResponse>;
    metadata: Metadata;
    actor: EActorName;
}) => {
    const rpcName = rpc.name;
    const startTime = performance.now();
    metrics.rpcCall.incoming.inc({ [EMetricsLabel.RpcName]: rpcName });

    const { messageWithContext } = embedContextToMessage(rpc);

    const username = extractUsername(metadata);
    const traceId = extractTraceId(metadata) ?? generateTraceId();

    const payload = call.request;

    const logger = defaultLogger.createChildLogger({
        actor,
        rpcName,
        traceId,
        username,
    });

    metrics.subscriptions.total.inc({ [EMetricsLabel.RpcName]: rpcName });
    metrics.subscriptions.active.inc({ [EMetricsLabel.RpcName]: rpcName });

    const logStart = (logParams: Record<string, unknown> = {}) => {
        logger.info({
            message: messageWithContext('started'),
            traceId,
            ...payload,
            ...logParams,
        });
    };

    const measureOnlyFirstResponse = once(() => {
        metrics.rpcCall.outgoing.inc({ [EMetricsLabel.RpcName]: rpcName });
        metrics.rpcCall.responseDuration.observe(
            { [EMetricsLabel.RpcName]: rpcName },
            (performance.now() - startTime) / 1000,
        );
    });

    const handleResponse = (logParams: Partial<TResponse> & Record<string, unknown> = {}) => {
        logger.info({
            message: messageWithContext('sent updates'),
            ...logParams,
        });
        measureOnlyFirstResponse();
    };

    const handleError = (error: unknown) => {
        const grpcError = convertToGrpcError(error);
        const errorMessage = grpcError.details;

        call.emit('error', grpcError.getFilteredGrpcError());

        call.end();
        metrics.subscriptions.active.dec({ [EMetricsLabel.RpcName]: rpcName });

        logger.error({
            message: messageWithContext(errorMessage),
            error,
        });
        metrics.rpcCall.rpcError.inc({
            [EMetricsLabel.RpcName]: rpcName,
            [EMetricsLabel.ErrorMessage]: errorMessage,
        });

        return { errorMessage };
    };

    const handleComplete = () => {
        metrics.subscriptions.active.dec({ [EMetricsLabel.RpcName]: rpcName });

        call.end();
    };

    // TODO: test this
    const close$ = fromEvent(call, 'close').pipe(first());
    const takeUntilChannelClose =
        () =>
        <T>(source$: Observable<T>) =>
            source$.pipe(
                takeUntil(close$),
                finalize(() => {
                    metrics.subscriptions.active.dec({ [EMetricsLabel.RpcName]: rpcName });
                    logger.info({ message: messageWithContext(`Subscription closed`) });
                }),
            );

    return {
        logger,
        rpcName,
        username,
        traceId,
        payload,
        messageWithContext,
        logStart,
        takeUntilChannelClose,
        handleResponse,
        handleError,
        handleComplete,
    };
};
