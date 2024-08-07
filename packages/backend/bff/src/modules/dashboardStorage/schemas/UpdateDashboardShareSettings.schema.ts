import type {
    TUpdateDashboardShareSettingsRequest,
    TUpdateDashboardShareSettingsResponse,
} from '@grpc-schemas/dashboard_storage-api-sdk/services/dashboard_storage/v1/sharing_api';

export type TUpdateDashboardShareSettingsRequestPayload = TUpdateDashboardShareSettingsRequest & {
    type: 'UpdateDashboardShareSettings';
};

export type TUpdateDashboardShareSettingsResponsePayload = TUpdateDashboardShareSettingsResponse & {
    type: 'DashboardShareSettingsUpdated';
};
