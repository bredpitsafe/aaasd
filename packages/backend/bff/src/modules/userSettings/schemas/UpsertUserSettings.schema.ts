import type {
    TUpsertUserSettingsRequest,
    TUpsertUserSettingsResponse,
} from '@grpc-schemas/user_settings-api-sdk/services/user_settings/v1/user_settings_api';

export type TUpsertUserSettingsRequestPayload = TUpsertUserSettingsRequest & {
    type: 'UpsertUserSettings';
};

export type TUpsertUserSettingsResponsePayload = TUpsertUserSettingsResponse & {
    type: 'Upserted';
};
