import type {
    TUpdateDashboardPermissionsRequest,
    TUpdateDashboardPermissionsResponse,
} from '@grpc-schemas/dashboard_storage-api-sdk/services/dashboard_storage/v1/sharing_api';

export type TUpdateDashboardPermissionsRequestPayload = TUpdateDashboardPermissionsRequest & {
    type: 'UpdateDashboardPermissions';
};

export type TUpdateDashboardPermissionsResponsePayload = TUpdateDashboardPermissionsResponse & {
    type: 'PermissionsUpdated';
};
