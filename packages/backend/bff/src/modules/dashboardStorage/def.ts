import type { TRpcApi } from '../../def/rpc.ts';
import type { TStageName } from '../../def/stages.ts';
import type {
    TCreateDashboardRequestPayload,
    TCreateDashboardResponsePayload,
} from './schemas/CreateDashboard.schema.ts';
import type {
    TDeleteDashboardRequestPayload,
    TDeleteDashboardResponsePayload,
} from './schemas/DeleteDashboard.schema.ts';
import type {
    TFetchDashboardConfigRequestPayload,
    TFetchDashboardConfigResponsePayload,
} from './schemas/FetchDashboardConfig.schema.ts';
import type {
    TFetchDashboardDraftConfigRequestPayload,
    TFetchDashboardDraftConfigResponsePayload,
} from './schemas/FetchDashboardDraftConfig.schema.ts';
import type {
    TImportDashboardRequestPayload,
    TImportDashboardResponsePayload,
} from './schemas/ImportDashboard.schema.ts';
import type {
    TRenameDashboardRequestPayload,
    TRenameDashboardResponsePayload,
} from './schemas/RenameDashboard.schema.ts';
import type {
    TResetDashboardDraftConfigRequestPayload,
    TResetDashboardDraftConfigResponsePayload,
} from './schemas/ResetDashboardDraftConfig.schema.ts';
import type {
    TSubmitDashboardDraftConfigRequestPayload,
    TSubmitDashboardDraftConfigResponsePayload,
} from './schemas/SubmitDashboardDraftConfig.schema.ts';
import type {
    TSubscribeToDashboardRequestPayload,
    TSubscribeToDashboardResponsePayload,
} from './schemas/SubscribeToDashboard.schema.ts';
import type {
    TSubscribeToDashboardListRequestPayload,
    TSubscribeToDashboardListResponsePayload,
} from './schemas/SubscribeToDashboardList.schema.ts';
import type {
    TSubscribeToDashboardPermissionsRequestPayload,
    TSubscribeToDashboardPermissionsResponsePayload,
} from './schemas/SubscribeToDashboardPermissions.schema.ts';
import type {
    TUpdateDashboardDraftConfigRequestPayload,
    TUpdateDashboardDraftConfigResponsePayload,
} from './schemas/UpdateDashboardDraftConfig.schema.ts';
import type {
    TUpdateDashboardPermissionsRequestPayload,
    TUpdateDashboardPermissionsResponsePayload,
} from './schemas/UpdateDashboardPermissions.schema.ts';
import type {
    TUpdateDashboardScopeBindingRequestPayload,
    TUpdateDashboardScopeBindingResponsePayload,
} from './schemas/UpdateDashboardScopeBinding.schema.ts';
import type {
    TUpdateDashboardShareSettingsRequestPayload,
    TUpdateDashboardShareSettingsResponsePayload,
} from './schemas/UpdateDashboardShareSettings.schema.ts';

export enum EDashboardStorageRouteName {
    CreateDashboard = 'CreateDashboard',
    ImportDashboard = 'ImportDashboard',
    DeleteDashboard = 'DeleteDashboard',
    RenameDashboard = 'RenameDashboard',
    UpdateDashboardScopeBinding = 'UpdateDashboardScopeBinding',
    FetchDashboardConfig = 'FetchDashboardConfig',
    SubscribeToDashboard = 'SubscribeToDashboard',
    SubscribeToDashboardList = 'SubscribeToDashboardList',

    // DashboardDraftService
    FetchDashboardDraftConfig = 'FetchDashboardDraftConfig',
    ResetDashboardDraftConfig = 'ResetDashboardDraftConfig',
    UpdateDashboardDraftConfig = 'UpdateDashboardDraftConfig',
    SubmitDashboardDraftConfig = 'SubmitDashboardDraftConfig',

    // DashboardSharingService
    UpdateDashboardPermissions = 'UpdateDashboardPermissions',
    UpdateDashboardShareSettings = 'UpdateDashboardShareSettings',
    SubscribeToDashboardPermissions = 'SubscribeToDashboardPermissions',
}

export type TDashboardStorageRoutesMap = {
    [EDashboardStorageRouteName.CreateDashboard]: TRpcApi<
        TCreateDashboardRequestPayload,
        TCreateDashboardResponsePayload
    >;
    [EDashboardStorageRouteName.ImportDashboard]: TRpcApi<
        TImportDashboardRequestPayload,
        TImportDashboardResponsePayload
    >;
    [EDashboardStorageRouteName.DeleteDashboard]: TRpcApi<
        TDeleteDashboardRequestPayload,
        TDeleteDashboardResponsePayload
    >;
    [EDashboardStorageRouteName.RenameDashboard]: TRpcApi<
        TRenameDashboardRequestPayload,
        TRenameDashboardResponsePayload
    >;
    [EDashboardStorageRouteName.UpdateDashboardScopeBinding]: TRpcApi<
        TUpdateDashboardScopeBindingRequestPayload,
        TUpdateDashboardScopeBindingResponsePayload
    >;
    [EDashboardStorageRouteName.SubmitDashboardDraftConfig]: TRpcApi<
        TSubmitDashboardDraftConfigRequestPayload,
        TSubmitDashboardDraftConfigResponsePayload
    >;
    [EDashboardStorageRouteName.FetchDashboardConfig]: TRpcApi<
        TFetchDashboardConfigRequestPayload,
        TFetchDashboardConfigResponsePayload
    >;
    [EDashboardStorageRouteName.SubscribeToDashboard]: TRpcApi<
        TSubscribeToDashboardRequestPayload,
        TSubscribeToDashboardResponsePayload
    >;
    [EDashboardStorageRouteName.SubscribeToDashboardList]: TRpcApi<
        TSubscribeToDashboardListRequestPayload,
        TSubscribeToDashboardListResponsePayload
    >;
    [EDashboardStorageRouteName.FetchDashboardDraftConfig]: TRpcApi<
        TFetchDashboardDraftConfigRequestPayload,
        TFetchDashboardDraftConfigResponsePayload
    >;
    [EDashboardStorageRouteName.ResetDashboardDraftConfig]: TRpcApi<
        TResetDashboardDraftConfigRequestPayload,
        TResetDashboardDraftConfigResponsePayload
    >;
    [EDashboardStorageRouteName.UpdateDashboardDraftConfig]: TRpcApi<
        TUpdateDashboardDraftConfigRequestPayload,
        TUpdateDashboardDraftConfigResponsePayload
    >;
    [EDashboardStorageRouteName.UpdateDashboardPermissions]: TRpcApi<
        TUpdateDashboardPermissionsRequestPayload,
        TUpdateDashboardPermissionsResponsePayload
    >;
    [EDashboardStorageRouteName.UpdateDashboardShareSettings]: TRpcApi<
        TUpdateDashboardShareSettingsRequestPayload,
        TUpdateDashboardShareSettingsResponsePayload
    >;
    [EDashboardStorageRouteName.SubscribeToDashboardPermissions]: TRpcApi<
        TSubscribeToDashboardPermissionsRequestPayload,
        TSubscribeToDashboardPermissionsResponsePayload
    >;
};

// TODO: add stage in configs
export const DASHBOARD_STORAGE_REQUEST_STAGE = 'dashboard-storage' as TStageName;
