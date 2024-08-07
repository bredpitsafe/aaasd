import type {
    TSubscribeToDashboardListRequest,
    TSubscribeToDashboardListResponse,
} from '@grpc-schemas/dashboard_storage-api-sdk/services/dashboard_storage/v1/dashboard_api';

export type TSubscribeToDashboardListRequestPayload = TSubscribeToDashboardListRequest & {
    type: 'SubscribeToDashboardList';
};

export type TSubscribeToDashboardListResponsePayload = TSubscribeToDashboardListResponse & {
    type: 'DashboardList';
};
