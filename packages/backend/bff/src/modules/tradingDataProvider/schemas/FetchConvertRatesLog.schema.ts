import { Assign } from '@backend/utils/src/util-types.ts';
import type {
    FetchConvertRatesLogRequest,
    FetchConvertRatesLogResponse,
    LogRequestParams,
    LogRequestTokenParams,
} from '@bhft/trading_data_provider-api-sdk/index.services.trading_data_provider.v1.js';
import type { RequiredDeep, SetRequired } from 'type-fest';

import type { WithRequestStage } from '../../../def/stages.ts';

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
