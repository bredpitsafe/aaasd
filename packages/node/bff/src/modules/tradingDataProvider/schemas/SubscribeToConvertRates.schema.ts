import type {
    SimpleAggregation,
    SimpleAggregation_AggregationFunction,
    Subscribed,
    SubscribeToConvertRatesRequest,
    SubscribeToConvertRatesResponse_ConvertRatesRemoved,
    SubscribeToConvertRatesResponse_ConvertRatesUpdated,
    SubscriptionRequestParams,
} from '@bhft/trading_data_provider-api-sdk/index.services.trading_data_provider.v1.js';
import { RequiredDeep } from 'type-fest';

import { WithRequestStage } from '../../../def/stages.ts';
import type { Assign, InterfaceToType } from '../../../def/types.ts';
import { TDurationString } from '../../../utils/grpc.ts';

export type TSubscribeToConvertRatesRequestPayload = InterfaceToType<
    WithRequestStage<
        Assign<
            SubscribeToConvertRatesRequest,
            {
                type: 'SubscribeToConvertRates';
                params: Assign<
                    SubscriptionRequestParams,
                    {
                        aggregation?: Assign<
                            SimpleAggregation,
                            {
                                function: SimpleAggregation_AggregationFunction;
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
    | ({ type: 'ConvertRatesSubscribed' } & InterfaceToType<Subscribed>)
    | ({
          type: 'ConvertRatesUpdated';
      } & InterfaceToType<RequiredDeep<SubscribeToConvertRatesResponse_ConvertRatesUpdated>>)
    | ({
          type: 'ConvertRatesRemoved';
      } & InterfaceToType<RequiredDeep<SubscribeToConvertRatesResponse_ConvertRatesRemoved>>);
