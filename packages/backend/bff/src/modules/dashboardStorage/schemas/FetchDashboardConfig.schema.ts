import type {
    TFetchDashboardConfigRequest,
    TFetchDashboardConfigResponse,
} from '@grpc-schemas/dashboard_storage-api-sdk/services/dashboard_storage/v1/dashboard_api';

export type TFetchDashboardConfigRequestPayload = TFetchDashboardConfigRequest & {
    type: 'FetchDashboardConfig';
};

export type TFetchDashboardConfigResponsePayload = TFetchDashboardConfigResponse & {
    type: 'DashboardConfig';
};
