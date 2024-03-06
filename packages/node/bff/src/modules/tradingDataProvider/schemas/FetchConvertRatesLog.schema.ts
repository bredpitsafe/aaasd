import type {
    FetchConvertRatesLogRequest,
    FetchConvertRatesLogResponse,
    LogRequestParams,
    LogRequestTokenParams,
} from '@bhft/trading_data_provider-api-sdk/index.services.trading_data_provider.v1.js';
import { RequiredDeep, SetRequired } from 'type-fest';

import { WithRequestStage } from '../../../def/stages.ts';
import { Assign } from '../../../def/types.ts';

export type TFetchConvertRatesLogRequestPayload = WithRequestStage<
    Assign<
        FetchConvertRatesLogRequest,
        {
            type: 'FetchConvertRatesLog';
            params:
                | {
                      $case: 'byTime';
                      byTime: SetRequired<
                          LogRequestParams,
                          'platformTime' | 'direction' | 'softLimit'
                      >;
                  }
                | {
                      $case: 'byToken';
                      byToken: SetRequired<LogRequestTokenParams, 'token'>;
                  };
        }
    >
>;

export type TFetchConvertRatesLogResponsePayload = Assign<
    RequiredDeep<FetchConvertRatesLogResponse>,
    {
        type: 'ConvertRatesLog';
    }
>;
