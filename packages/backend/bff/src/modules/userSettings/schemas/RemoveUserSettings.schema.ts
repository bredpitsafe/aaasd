import type {
    TRemoveUserSettingsRequest,
    TRemoveUserSettingsResponse,
} from '@grpc-schemas/user_settings-api-sdk/services/user_settings/v1/user_settings_api';

export type TRemoveUserSettingsRequestPayload = TRemoveUserSettingsRequest & {
    type: 'RemoveUserSettings';
};

export type TRemoveUserSettingsResponsePayload = TRemoveUserSettingsResponse & {
    type: 'Removed';
};
