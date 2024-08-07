import type {
    TUpsertUserSettingsRequest,
    TUpsertUserSettingsResponse,
} from '@grpc-schemas/user_settings-api-sdk/services/user_settings/v1/user_settings_api';

import type { TRpcRouteTransformers } from '../../../rpc/def.ts';
import type { EUserSettingsRouteName } from '../def.ts';

export const upsertUserSettingsTransformers: TRpcRouteTransformers<
    EUserSettingsRouteName.UpsertUserSettings,
    TUpsertUserSettingsRequest,
    TUpsertUserSettingsResponse
> = {
    fromRequestToGrpc(req) {
        return req.payload;
    },
    fromGrpcToResponse(res) {
        return {
            type: 'Upserted',
            platformTime: res.platformTime,
        };
    },
};
