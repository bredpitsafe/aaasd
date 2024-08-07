import type { Assign } from '@common/types';
import type {
    TFetchConvertRatesLogRequest,
    TFetchConvertRatesLogResponse,
} from '@grpc-schemas/trading_data_provider-api-sdk/index.services.trading_data_provider.v1.js';

import type { WithMock } from '../../../def/mock.ts';
import type { WithRequestStage } from '../../../def/stages.ts';

export type TFetchConvertRatesLogRequestPayload = WithMock<
    WithRequestStage<
        Assign<
            TFetchConvertRatesLogRequest,
            {
                type: 'FetchConvertRatesLog';
            }
        >
    >
>;

export type TFetchConvertRatesLogResponsePayload = Assign<
    TFetchConvertRatesLogResponse,
    {
        type: 'ConvertRatesLog';
    }
>;
