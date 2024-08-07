import type { Assign } from '@common/types';
import type {
    TSimpleAggregation,
    TSimpleAggregationAggregationFunction,
    TSubscribed,
    TSubscribeToConvertRatesRequest,
    TSubscribeToConvertRatesResponseConvertRatesRemoved,
    TSubscribeToConvertRatesResponseConvertRatesUpdated,
    TSubscriptionRequestParams,
} from '@grpc-schemas/trading_data_provider-api-sdk/index.services.trading_data_provider.v1.js';

import type { WithMock } from '../../../def/mock.ts';
import type { WithRequestStage } from '../../../def/stages.ts';
import type { TDurationString } from '../../../utils/grpc.ts';

export type TSubscribeToConvertRatesRequestPayload = WithMock<
    WithRequestStage<
        Assign<
            TSubscribeToConvertRatesRequest,
            {
                type: 'SubscribeToConvertRates';
                params: Assign<
                    TSubscriptionRequestParams,
                    {
                        aggregation: Assign<
                            TSimpleAggregation,
                            {
                                function: TSimpleAggregationAggregationFunction;
                                interval: TDurationString;
                            }
                        >;
                    }
                >;
            }
        >
    >
>;

export type TSubscribeToConvertRatesResponsePayload =
    | ({ type: 'ConvertRatesSubscribed' } & TSubscribed)
    | ({
          type: 'ConvertRatesUpdated';
      } & TSubscribeToConvertRatesResponseConvertRatesUpdated)
    | ({
          type: 'ConvertRatesRemoved';
      } & TSubscribeToConvertRatesResponseConvertRatesRemoved);
