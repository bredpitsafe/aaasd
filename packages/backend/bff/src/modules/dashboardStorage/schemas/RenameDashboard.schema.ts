import type {
    TRenameDashboardRequest,
    TRenameDashboardResponse,
} from '@grpc-schemas/dashboard_storage-api-sdk/services/dashboard_storage/v1/dashboard_api';

export type TRenameDashboardRequestPayload = TRenameDashboardRequest & {
    type: 'RenameDashboard';
};

export type TRenameDashboardResponsePayload = TRenameDashboardResponse & {
    type: 'DashboardRenamed';
};
