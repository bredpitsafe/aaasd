import type { TRpcApi } from '../../def/rpc.ts';
import type { TStageName } from '../../def/stages.ts';
import type {
    TRemoveUserSettingsRequestPayload,
    TRemoveUserSettingsResponsePayload,
} from './schemas/RemoveUserSettings.schema.ts';
import type {
    TSubscribeToUserSettingsRequestPayload,
    TSubscribeToUserSettingsResponsePayload,
} from './schemas/SubscribeToUserSettings.schema.ts';
import type {
    TUpsertUserSettingsRequestPayload,
    TUpsertUserSettingsResponsePayload,
} from './schemas/UpsertUserSettings.schema.ts';

export enum EUserSettingsRouteName {
    SubscribeToUserSettings = 'SubscribeToUserSettings',
    UpsertUserSettings = 'UpsertUserSettings',
    RemoveUserSettings = 'RemoveUserSettings',
}

export type TUserSettingsRoutesMap = {
    [EUserSettingsRouteName.SubscribeToUserSettings]: TRpcApi<
        TSubscribeToUserSettingsRequestPayload,
        TSubscribeToUserSettingsResponsePayload
    >;
    [EUserSettingsRouteName.UpsertUserSettings]: TRpcApi<
        TUpsertUserSettingsRequestPayload,
        TUpsertUserSettingsResponsePayload
    >;
    [EUserSettingsRouteName.RemoveUserSettings]: TRpcApi<
        TRemoveUserSettingsRequestPayload,
        TRemoveUserSettingsResponsePayload
    >;
};

export const USER_SETTINGS_REQUEST_STAGE = 'user-settings' as TStageName;
