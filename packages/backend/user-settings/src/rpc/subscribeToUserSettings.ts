import { convertToGrpcError } from '@backend/grpc/src/utils/error.ts';
import { extractTraceId, extractUsername } from '@backend/grpc/src/utils/metadata-utils.ts';
import { generateTraceId, shortenLoggingArray } from '@common/utils';
import type {
    TSubscribeToUserSettingsRequest,
    TSubscribeToUserSettingsResponse,
} from '@grpc-schemas/user_settings-api-sdk/services/user_settings/v1/user_settings_api.d.ts';

import { EActorName } from '../defs/actors.ts';
import type { ServerStreamingRpc } from '../defs/grpc-types.ts';
import { repository } from '../modules/db/repository.ts';
import { EMetricsLabel } from '../modules/metrics/def.ts';
import { metrics } from '../modules/metrics/service.ts';
import { defaultLogger } from '../utils/logger.ts';

const rpcName = 'subscribeToUserSettings';

export const subscribeToUserSettings: ServerStreamingRpc<
    TSubscribeToUserSettingsRequest,
    TSubscribeToUserSettingsResponse
> = async (call) => {
    const startTime = performance.now();
    metrics.rpcCall.incoming.inc({ [EMetricsLabel.RpcName]: rpcName });

    const traceId = extractTraceId(call.metadata) ?? generateTraceId();
    const username = extractUsername(call.metadata);

    const logger = defaultLogger.createChildLogger({
        actor: EActorName.Rpc,
        rpcName,
        traceId,
        username,
    });

    try {
        const app = call.request.filters?.app;

        logger.info({
            message: `${rpcName} called`,
            app,
        });

        call.write({
            response: { type: 'ok', ok: { platformTime: new Date().toISOString() } },
        });

        const snapshot = await repository.getSnapshot({ username, app, traceId });

        call.write({ response: { type: 'snapshot', snapshot: { entities: snapshot } } });
        logger.info({
            message: `Snapshot sent`,
            snapshot: shortenLoggingArray(snapshot),
        });

        metrics.rpcCall.outgoing.inc({ [EMetricsLabel.RpcName]: rpcName });
        metrics.rpcCall.responseDuration.observe(
            { [EMetricsLabel.RpcName]: rpcName },
            (performance.now() - startTime) / 1000,
        );

        metrics.subscriptions.total.inc();
        metrics.subscriptions.active.inc();
        const subscription = repository.subscribeToUpdates({ username, app, traceId }).subscribe({
            next: (updates) => {
                call.write({
                    response: {
                        type: 'updates',
                        updates,
                    },
                });

                logger.info({
                    message: `Updates sent`,
                    updates: {
                        upserted: shortenLoggingArray(updates.upserted),
                        removed: shortenLoggingArray(updates.removed),
                    } as typeof updates,
                });
            },
            error: (error) => {
                throw error;
            },
            complete: () => {
                call.end();
                metrics.subscriptions.active.dec();
            },
        });

        call.on('close', () => {
            subscription.unsubscribe();

            metrics.subscriptions.active.dec();
            logger.info({
                message: `Subscription closed`,
            });
        });
    } catch (error) {
        const grpcError = convertToGrpcError(error);
        call.emit('error', grpcError.getFilteredGrpcError());
        call.end();

        metrics.subscriptions.active.dec();

        logger.error({
            message: grpcError.details,
            error,
        });
        metrics.rpcCall.rpcError.inc({
            [EMetricsLabel.RpcName]: rpcName,
            [EMetricsLabel.ErrorMessage]: grpcError.details,
        });
    }
};
