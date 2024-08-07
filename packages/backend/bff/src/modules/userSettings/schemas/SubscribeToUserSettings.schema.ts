import type {
    TSubscribeToUserSettingsRequest,
    TSubscribeToUserSettingsResponseOk,
    TSubscribeToUserSettingsResponseSnapshot,
    TSubscribeToUserSettingsResponseUpdates,
} from '@grpc-schemas/user_settings-api-sdk/services/user_settings/v1/user_settings_api.js';

import type { ERpcSubscriptionEvent } from '../../../def/rpc.ts';

export type TSubscribeToUserSettingsRequestPayload = TSubscribeToUserSettingsRequest & {
    type: 'SubscribeToUserSettings';
};

export type TSubscribeToUserSettingsResponsePayload =
    | ({ type: ERpcSubscriptionEvent.Ok } & TSubscribeToUserSettingsResponseOk)
    | ({
          type: ERpcSubscriptionEvent.Snapshot;
      } & TSubscribeToUserSettingsResponseSnapshot)
    | ({
          type: ERpcSubscriptionEvent.Updates;
      } & TSubscribeToUserSettingsResponseUpdates);
