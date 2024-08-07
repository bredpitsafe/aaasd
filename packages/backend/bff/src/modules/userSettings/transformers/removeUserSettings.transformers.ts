import type {
    TRemoveUserSettingsRequest,
    TRemoveUserSettingsResponse,
} from '@grpc-schemas/user_settings-api-sdk/services/user_settings/v1/user_settings_api';

import type { TRpcRouteTransformers } from '../../../rpc/def.ts';
import type { EUserSettingsRouteName } from '../def.ts';

export const removeUserSettingsTransformers: TRpcRouteTransformers<
    EUserSettingsRouteName.RemoveUserSettings,
    TRemoveUserSettingsRequest,
    TRemoveUserSettingsResponse
> = {
    fromRequestToGrpc(req) {
        return req.payload;
    },

    fromGrpcToResponse(res) {
        return {
            type: 'Removed',
            platformTime: res.platformTime,
            removedEntitiesCount: res.removedEntitiesCount,
        };
    },
};
