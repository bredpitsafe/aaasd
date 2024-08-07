import { GrpcResponseStatus } from '@backend/grpc/src/types/index.ts';
import { GrpcError } from '@backend/grpc/src/utils/error.ts';
import { extractTraceId, extractUsername } from '@backend/grpc/src/utils/metadata-utils.ts';
import { embedContextToMessage, generateTraceId } from '@common/utils';
import type { sendUnaryData, ServerUnaryCall } from '@grpc/grpc-js';
import type { Observable } from 'rxjs';
import { firstValueFrom, throwError, timeout } from 'rxjs';

import type { EActorName } from '../../def/actor.ts';
import { EMetricsLabel } from '../../def/metrics.ts';
import { config } from '../../utils/config.ts';
import { convertToGrpcError } from '../../utils/errors.ts';
import { defaultLogger } from '../../utils/logger.ts';
import { metrics } from '../../utils/metrics.ts';

export const handleUnaryRpcInitialization = <TRequest, TResponse>({
    rpc,
    actor,
    call,
    callback,
}: {
    rpc: Function;
    call: ServerUnaryCall<TRequest, TResponse>;
    callback: sendUnaryData<TResponse>;
    actor: EActorName;
}) => {
    const rpcName = rpc.name;
    const startTime = performance.now();
    metrics.rpcCall.incoming.inc({ [EMetricsLabel.RpcName]: rpcName });

    const { messageWithContext } = embedContextToMessage(rpc);

    const username = extractUsername(call.metadata);
    const traceId = extractTraceId(call.metadata) ?? generateTraceId();
    const payload = call.request;

    const logger = defaultLogger.createChildLogger({
        actor,
        rpcName,
        traceId,
        username,
    });

    const logStart = (logParams: Record<string, unknown> & Partial<TRequest> = {}) => {
        logger.info({
            message: messageWithContext('started'),
            traceId,
            ...payload,
            ...logParams,
        });
    };

    const handle$ = async ({
        obs$,
        onResponse,
        responseLogParams,
        onError,
    }: {
        obs$: Observable<TResponse>;
        onResponse?: (response: TResponse) => void;
        responseLogParams?: (res: TResponse) => Partial<TResponse>;
        onError?: (errorMessage: string) => void;
    }) => {
        try {
            const firstResponse = await firstValueFrom(
                obs$.pipe(
                    timeout({
                        first: config.rpc.timeout,
                        with: () =>
                            throwError(
                                () =>
                                    new GrpcError({
                                        code: GrpcResponseStatus.DEADLINE_EXCEEDED,
                                        details: `The request failed to receive a response within the specified timeout of ${config.rpc.timeout}ms.`,
                                    }),
                            ),
                    }),
                ),
            );

            callback(null, firstResponse);

            logger.info({
                message: messageWithContext('finished'),
                ...responseLogParams?.(firstResponse),
            });
            metrics.rpcCall.outgoing.inc({ [EMetricsLabel.RpcName]: rpcName });
            metrics.rpcCall.responseDuration.observe(
                { [EMetricsLabel.RpcName]: rpcName },
                (performance.now() - startTime) / 1000,
            );

            onResponse?.(firstResponse);
        } catch (error) {
            const grpcError = convertToGrpcError(error);
            const errorMessage = grpcError.details;

            logger.error({
                message: messageWithContext(errorMessage),
                error,
            });
            metrics.rpcCall.rpcError.inc({
                [EMetricsLabel.RpcName]: rpcName,
                [EMetricsLabel.ErrorMessage]: errorMessage,
            });

            callback(grpcError.getFilteredGrpcError());

            onError?.(errorMessage);
        }
    };

    return {
        logger,
        rpcName,
        username,
        traceId,
        payload,
        messageWithContext,
        logStart,
        handle$,
    };
};
