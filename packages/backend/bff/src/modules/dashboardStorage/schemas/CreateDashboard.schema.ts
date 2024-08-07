import type {
    TCreateDashboardRequest,
    TCreateDashboardResponse,
} from '@grpc-schemas/dashboard_storage-api-sdk/services/dashboard_storage/v1/dashboard_api';

export type TCreateDashboardRequestPayload = TCreateDashboardRequest & {
    type: 'CreateDashboard';
};

export type TCreateDashboardResponsePayload = TCreateDashboardResponse & {
    type: 'DashboardCreated';
};
