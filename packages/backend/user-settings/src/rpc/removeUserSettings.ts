import { convertToGrpcError } from '@backend/grpc/src/utils/error.ts';
import { getPlatformTimeResponse } from '@backend/grpc/src/utils/index.ts';
import { extractTraceId, extractUsername } from '@backend/grpc/src/utils/metadata-utils.ts';
import { generateTraceId } from '@common/utils';
import type {
    TRemoveUserSettingsRequest,
    TRemoveUserSettingsResponse,
} from '@grpc-schemas/user_settings-api-sdk/services/user_settings/v1/user_settings_api.d.ts';

import { EActorName } from '../defs/actors.ts';
import type { UnaryRpc } from '../defs/grpc-types.ts';
import { repository } from '../modules/db/repository.ts';
import { EMetricsLabel } from '../modules/metrics/def.ts';
import { metrics } from '../modules/metrics/service.ts';
import { defaultLogger } from '../utils/logger.ts';

const rpcName = 'removeUserSettings';

export const removeUserSettings: UnaryRpc<
    TRemoveUserSettingsRequest,
    TRemoveUserSettingsResponse
> = (call, callback) => {
    const startTime = performance.now();
    metrics.rpcCall.incoming.inc({ [EMetricsLabel.RpcName]: rpcName });

    const username = extractUsername(call.metadata);
    const traceId = extractTraceId(call.metadata) ?? generateTraceId();

    const logger = defaultLogger.createChildLogger({
        actor: EActorName.Rpc,
        rpcName,
        traceId,
        username,
    });

    const app = call.request.filters?.app;

    logger.info({
        message: `${rpcName} called`,
        app,
    });

    repository
        .removeUserSettings({ username, app, traceId })
        .then(({ deletedCount }) => {
            callback(null, {
                ...getPlatformTimeResponse(),
                removedEntitiesCount: deletedCount,
            });

            logger.info({
                message: `Removed successfully ${deletedCount} settings`,
            });
            metrics.rpcCall.outgoing.inc({ [EMetricsLabel.RpcName]: rpcName });
            metrics.rpcCall.responseDuration.observe(
                { [EMetricsLabel.RpcName]: rpcName },
                (performance.now() - startTime) / 1000,
            );
        })
        .catch((error) => {
            const grpcError = convertToGrpcError(error);

            callback(grpcError.getFilteredGrpcError());

            logger.error({
                message: grpcError.details,
                error,
            });
            metrics.rpcCall.rpcError.inc({
                [EMetricsLabel.RpcName]: rpcName,
                [EMetricsLabel.ErrorMessage]: grpcError.details,
            });
        });
};
