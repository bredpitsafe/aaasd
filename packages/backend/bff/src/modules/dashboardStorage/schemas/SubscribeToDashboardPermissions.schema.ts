import type {
    TSubscribeToDashboardPermissionsRequest,
    TSubscribeToDashboardPermissionsResponse,
} from '@grpc-schemas/dashboard_storage-api-sdk/services/dashboard_storage/v1/sharing_api';

export type TSubscribeToDashboardPermissionsRequestPayload =
    TSubscribeToDashboardPermissionsRequest & {
        type: 'SubscribeToDashboardPermissions';
    };

export type TSubscribeToDashboardPermissionsResponsePayload =
    TSubscribeToDashboardPermissionsResponse & {
        type: 'DashboardPermissionsList';
    };
