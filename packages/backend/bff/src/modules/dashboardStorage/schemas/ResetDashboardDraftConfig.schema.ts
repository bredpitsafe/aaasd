import type {
    TResetDashboardDraftConfigRequest,
    TResetDashboardDraftConfigResponse,
} from '@grpc-schemas/dashboard_storage-api-sdk/services/dashboard_storage/v1/draft_api';

export type TResetDashboardDraftConfigRequestPayload = TResetDashboardDraftConfigRequest & {
    type: 'ResetDashboardDraftConfig';
};

export type TResetDashboardDraftConfigResponsePayload = TResetDashboardDraftConfigResponse & {
    type: 'DashboardDraftConfigReset';
};
