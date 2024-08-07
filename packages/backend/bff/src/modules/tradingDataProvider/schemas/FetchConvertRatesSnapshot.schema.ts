import type { Assign } from '@common/types';
import type {
    TFetchConvertRatesSnapshotRequest,
    TFetchConvertRatesSnapshotResponse,
} from '@grpc-schemas/trading_data_provider-api-sdk/index.services.trading_data_provider.v1.js';

import type { WithMock } from '../../../def/mock.ts';
import type { WithRequestStage } from '../../../def/stages.ts';

export type TFetchConvertRatesSnapshotRequestPayload = WithMock<
    WithRequestStage<
        Assign<
            TFetchConvertRatesSnapshotRequest,
            {
                type: 'FetchConvertRatesSnapshot';
            }
        >
    >
>;

export type TFetchConvertRatesSnapshotResponsePayload = Assign<
    TFetchConvertRatesSnapshotResponse,
    {
        type: 'ConvertRatesSnapshot';
    }
>;
