import type {
    TSubmitDashboardDraftConfigRequest,
    TSubmitDashboardDraftConfigResponse,
} from '@grpc-schemas/dashboard_storage-api-sdk/services/dashboard_storage/v1/draft_api';

export type TSubmitDashboardDraftConfigRequestPayload = TSubmitDashboardDraftConfigRequest & {
    type: 'SubmitDashboardDraftConfig';
};

export type TSubmitDashboardDraftConfigResponsePayload = TSubmitDashboardDraftConfigResponse & {
    type: 'DashboardDraftConfigSubmitted';
};
