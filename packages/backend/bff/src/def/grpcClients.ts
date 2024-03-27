import {
    ConvertRatesServiceClient as ConvertRatesServiceClientV1,
    StmServiceClient as StmServiceClientV1,
} from '@bhft/trading_data_provider-api-sdk/index.services.trading_data_provider.v1.js';

export enum EGrpcClientName {
    ConvertRatesV1 = 'ConvertRatesV1',
    StmV1 = 'StmV1',
}

export const grpcClients = {
    [EGrpcClientName.ConvertRatesV1]: ConvertRatesServiceClientV1,
    [EGrpcClientName.StmV1]: StmServiceClientV1,
} as const;
