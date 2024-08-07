import type { TStmBalance } from '@grpc-schemas/trading_data_provider-api-sdk/index.services.trading_data_provider.v1.js';

export const stmBalance: Required<TStmBalance> = {
    platformTime: '2024-02-26 01:59:47.376',
    virtualAccountId: 123,
    virtualAccountName: 'VIRTUAL_ACCOUNT',
    instrumentId: 456,
    instrumentName: 'INSTRUMENT_ID',
    robotId: 789,
    robotName: 'ROBOT_NAME',
    balances: [
        {
            assetId: 123,
            assetName: 'ASSET_NAME_1',
            amount: 12.345,
        },
        {
            assetId: 456,
            assetName: 'ASSET_NAME_2',
            amount: 456.789,
        },
        {
            assetId: 789,
            assetName: 'ASSET_NAME_3',
            amount: 789.012,
        },
    ],
    position: 123,
};
