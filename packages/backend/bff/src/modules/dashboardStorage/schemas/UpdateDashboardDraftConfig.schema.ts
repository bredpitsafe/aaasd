import type {
    TUpdateDashboardDraftConfigRequest,
    TUpdateDashboardDraftConfigResponse,
} from '@grpc-schemas/dashboard_storage-api-sdk/services/dashboard_storage/v1/draft_api';

export type TUpdateDashboardDraftConfigRequestPayload = TUpdateDashboardDraftConfigRequest & {
    type: 'UpdateDashboardDraftConfig';
};

export type TUpdateDashboardDraftConfigResponsePayload = TUpdateDashboardDraftConfigResponse & {
    type: 'DashboardDraftConfigUpdated';
};
