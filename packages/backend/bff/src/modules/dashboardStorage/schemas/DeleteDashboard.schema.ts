import type {
    TDeleteDashboardRequest,
    TDeleteDashboardResponse,
} from '@grpc-schemas/dashboard_storage-api-sdk/services/dashboard_storage/v1/dashboard_api';

export type TDeleteDashboardRequestPayload = TDeleteDashboardRequest & {
    type: 'DeleteDashboard';
};

export type TDeleteDashboardResponsePayload = TDeleteDashboardResponse & {
    type: 'DashboardDeleted';
};
