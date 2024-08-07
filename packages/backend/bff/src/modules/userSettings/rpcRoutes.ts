import { filter, map } from 'rxjs';

import { EGrpcClientName } from '../../def/grpcClients.ts';
import { ERpcMethod } from '../../rpc/def.ts';
import { createRpcRoutes } from '../../rpc/utils.ts';
import { pipeMetadataTransformers } from '../../transport/grpc/client/metadataTransformers.ts';
import { isDefined } from '../../utils/types.ts';
import { EUserSettingsRouteName, USER_SETTINGS_REQUEST_STAGE } from './def.ts';
import { removeUserSettingsTransformers } from './transformers/removeUserSettings.transformers.ts';
import { subscribeToUserSettingsTransformers } from './transformers/subscribeToUserSettings.transformers.ts';
import { upsertUserSettingsTransformers } from './transformers/upsertUserSettings.transformers.ts';

const requestStage = () => USER_SETTINGS_REQUEST_STAGE;

export const userSettingsRpcRoutes = createRpcRoutes<EUserSettingsRouteName>({
    [EUserSettingsRouteName.SubscribeToUserSettings]: {
        method: ERpcMethod.SUBSCRIBE,
        requestStage,
        handler(ctx) {
            return ctx
                .getGrpcClient(EGrpcClientName.UserSettingsV1)
                .subscribeToUserSettings(
                    subscribeToUserSettingsTransformers.fromRequestToGrpc(ctx.req),
                    pipeMetadataTransformers(ctx)(),
                )
                .pipe(
                    map(({ data }) => subscribeToUserSettingsTransformers.fromGrpcToResponse(data)),
                    filter(isDefined),
                );
        },
    },
    [EUserSettingsRouteName.UpsertUserSettings]: {
        method: ERpcMethod.CALL,
        requestStage,
        handler(ctx) {
            return ctx
                .getGrpcClient(EGrpcClientName.UserSettingsV1)
                .upsertUserSettings(
                    upsertUserSettingsTransformers.fromRequestToGrpc(ctx.req),
                    pipeMetadataTransformers(ctx)(),
                )
                .pipe(map(({ data }) => upsertUserSettingsTransformers.fromGrpcToResponse(data)));
        },
    },
    [EUserSettingsRouteName.RemoveUserSettings]: {
        method: ERpcMethod.CALL,
        requestStage,
        handler(ctx) {
            return ctx
                .getGrpcClient(EGrpcClientName.UserSettingsV1)
                .removeUserSettings(
                    removeUserSettingsTransformers.fromRequestToGrpc(ctx.req),
                    pipeMetadataTransformers(ctx)(),
                )
                .pipe(map(({ data }) => removeUserSettingsTransformers.fromGrpcToResponse(data)));
        },
    },
});
