import type {
    TSubscribeToDashboardRequest,
    TSubscribeToDashboardResponse,
} from '@grpc-schemas/dashboard_storage-api-sdk/services/dashboard_storage/v1/dashboard_api';

export type TSubscribeToDashboardRequestPayload = TSubscribeToDashboardRequest & {
    type: 'SubscribeToDashboard';
};

export type TSubscribeToDashboardResponsePayload = TSubscribeToDashboardResponse & {
    type: 'Dashboard';
};
