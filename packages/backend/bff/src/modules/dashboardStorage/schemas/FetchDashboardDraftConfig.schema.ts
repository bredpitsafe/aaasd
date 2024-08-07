import type {
    TFetchDashboardDraftConfigRequest,
    TFetchDashboardDraftConfigResponse,
} from '@grpc-schemas/dashboard_storage-api-sdk/services/dashboard_storage/v1/draft_api';

export type TFetchDashboardDraftConfigRequestPayload = TFetchDashboardDraftConfigRequest & {
    type: 'FetchDashboardDraftConfig';
};

export type TFetchDashboardDraftConfigResponsePayload = TFetchDashboardDraftConfigResponse & {
    type: 'DashboardDraftConfig';
};
