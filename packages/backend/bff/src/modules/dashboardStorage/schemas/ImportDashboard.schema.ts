import type {
    TImportDashboardRequest,
    TImportDashboardResponse,
} from '@grpc-schemas/dashboard_storage-api-sdk/services/dashboard_storage/v1/dashboard_api';

export type TImportDashboardRequestPayload = TImportDashboardRequest & {
    type: 'ImportDashboard';
};

export type TImportDashboardResponsePayload = TImportDashboardResponse & {
    type: 'DashboardImported';
};
