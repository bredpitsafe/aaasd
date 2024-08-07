import { assertFail } from '@common/utils';
import type {
    TSubscribeToUserSettingsRequest,
    TSubscribeToUserSettingsResponse,
} from '@grpc-schemas/user_settings-api-sdk/services/user_settings/v1/user_settings_api';

import { ERpcSubscriptionEvent } from '../../../def/rpc.ts';
import type { TRpcRouteTransformers } from '../../../rpc/def.ts';
import type { EUserSettingsRouteName } from '../def.ts';

export const subscribeToUserSettingsTransformers: TRpcRouteTransformers<
    EUserSettingsRouteName.SubscribeToUserSettings,
    TSubscribeToUserSettingsRequest,
    TSubscribeToUserSettingsResponse
> = {
    fromRequestToGrpc(req) {
        return req.payload;
    },
    fromGrpcToResponse(res) {
        // TODO: Change custom function to mapRpcSubscriptionEventToResponse
        switch (res.response?.type) {
            case 'ok': {
                return {
                    type: ERpcSubscriptionEvent.Ok,
                    platformTime: res.response.ok.platformTime,
                };
            }
            case 'snapshot': {
                return {
                    type: ERpcSubscriptionEvent.Snapshot,
                    entities: res.response.snapshot.entities,
                };
            }
            case 'updates': {
                return {
                    type: ERpcSubscriptionEvent.Updates,
                    upserted: res.response.updates.upserted,
                    removed: res.response.updates.removed,
                };
            }
            default: {
                assertFail(res.response);
            }
        }
    },
};
