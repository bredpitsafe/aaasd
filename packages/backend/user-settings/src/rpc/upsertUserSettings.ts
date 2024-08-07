import { convertToGrpcError } from '@backend/grpc/src/utils/error.ts';
import { getPlatformTimeResponse } from '@backend/grpc/src/utils/index.ts';
import { extractTraceId, extractUsername } from '@backend/grpc/src/utils/metadata-utils.ts';
import { generateTraceId } from '@common/utils';
import type {
    TUpsertUserSettingsRequest,
    TUpsertUserSettingsResponse,
} from '@grpc-schemas/user_settings-api-sdk/services/user_settings/v1/user_settings_api.d.ts';

import { EActorName } from '../defs/actors.ts';
import type { UnaryRpc } from '../defs/grpc-types.ts';
import { repository } from '../modules/db/repository.ts';
import { EMetricsLabel } from '../modules/metrics/def.ts';
import { metrics } from '../modules/metrics/service.ts';
import { defaultLogger } from '../utils/logger.ts';

const rpcName = 'upsertUserSettings';

export const upsertUserSettings: UnaryRpc<
    TUpsertUserSettingsRequest,
    TUpsertUserSettingsResponse
> = (call, callback) => {
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

    const settingsToUpsert = call.request.params.settings;

    logger.info({
        message: `${rpcName} called`,
        settingsToUpsert,
    });

    repository
        .upsertUserSettings(username, settingsToUpsert, traceId)
        .then(() => {
            callback(null, getPlatformTimeResponse());

            logger.info({ message: `Upserted settings successfully` });
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
