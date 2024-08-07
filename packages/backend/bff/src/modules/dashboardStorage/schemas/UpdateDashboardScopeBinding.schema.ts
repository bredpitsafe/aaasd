import type {
    TUpdateDashboardScopeBindingRequest,
    TUpdateDashboardScopeBindingResponse,
} from '@grpc-schemas/dashboard_storage-api-sdk/services/dashboard_storage/v1/scope_api';

export type TUpdateDashboardScopeBindingRequestPayload = TUpdateDashboardScopeBindingRequest & {
    type: 'UpdateDashboardScopeBinding';
};

export type TUpdateDashboardScopeBindingResponsePayload = TUpdateDashboardScopeBindingResponse & {
    type: 'DashboardScopeBindingUpdated';
};
