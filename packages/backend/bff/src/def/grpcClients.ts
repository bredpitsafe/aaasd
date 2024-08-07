import {
    GroupServiceClient,
    PermissionStreamerServiceClient,
    PolicyServiceClient,
    PolicyTemplateServiceClient,
    UserServiceClient,
} from '@grpc-schemas/authorization-api-sdk/index.services.authorization.v1.js';
import { DashboardServiceClient } from '@grpc-schemas/dashboard_storage-api-sdk/services/dashboard_storage/v1/dashboard_api.js';
import { DashboardDraftServiceClient } from '@grpc-schemas/dashboard_storage-api-sdk/services/dashboard_storage/v1/draft_api.js';
import { DashboardSharingServiceClient } from '@grpc-schemas/dashboard_storage-api-sdk/services/dashboard_storage/v1/sharing_api.js';
import {
    AssetServiceClient,
    IndexServiceClient,
    InstrumentServiceClient,
} from '@grpc-schemas/instruments-api-sdk/index.services.instruments.v1.js';
import {
    ConvertRatesServiceClient as ConvertRatesServiceClientV1,
    StmServiceClient as StmServiceClientV1,
} from '@grpc-schemas/trading_data_provider-api-sdk/index.services.trading_data_provider.v1.js';
import { TimeseriesServiceClient } from '@grpc-schemas/trading_data_provider-api-sdk/services/trading_data_provider/v1/timeseries_api.js';
import { UserSettingsServiceClient as UserSettingsClient } from '@grpc-schemas/user_settings-api-sdk/services/user_settings/v1/user_settings_api.js';

export enum EGrpcClientName {
    ConvertRatesV1 = 'ConvertRatesV1',
    StmV1 = 'StmV1',

    InstrumentsV1 = 'InstrumentsV1',
    AssetsV1 = 'AssetsV1',
    IndexesV1 = 'IndexesV1',

    GroupsV1 = 'GroupsV1',
    UsersV1 = 'UsersV1',
    PermissionsV1 = 'PermissionsV1',
    PoliciesV1 = 'PoliciesV1',
    PolicyTemplatesV1 = 'PolicyTemplatesV1',
    UserSettingsV1 = 'UserSettingsV1',

    TimeseriesV1 = 'TimeseriesV1',

    DashboardStorageV1 = 'DashboardStorageV1',
    DashboardDraftV1 = 'DashboardDraftV1',
    DashboardSharingV1 = 'DashboardSharingV1',
}

export const grpcClients = {
    [EGrpcClientName.ConvertRatesV1]: ConvertRatesServiceClientV1,
    [EGrpcClientName.StmV1]: StmServiceClientV1,
    [EGrpcClientName.InstrumentsV1]: InstrumentServiceClient,
    [EGrpcClientName.AssetsV1]: AssetServiceClient,
    [EGrpcClientName.IndexesV1]: IndexServiceClient,
    [EGrpcClientName.GroupsV1]: GroupServiceClient,
    [EGrpcClientName.UsersV1]: UserServiceClient,
    [EGrpcClientName.PermissionsV1]: PermissionStreamerServiceClient,
    [EGrpcClientName.PoliciesV1]: PolicyServiceClient,
    [EGrpcClientName.PolicyTemplatesV1]: PolicyTemplateServiceClient,
    [EGrpcClientName.UserSettingsV1]: UserSettingsClient,
    [EGrpcClientName.TimeseriesV1]: TimeseriesServiceClient,
    [EGrpcClientName.DashboardStorageV1]: DashboardServiceClient,
    [EGrpcClientName.DashboardDraftV1]: DashboardDraftServiceClient,
    [EGrpcClientName.DashboardSharingV1]: DashboardSharingServiceClient,
} as const;
