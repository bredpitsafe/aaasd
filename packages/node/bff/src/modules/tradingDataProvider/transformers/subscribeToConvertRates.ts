import {
    SubscribeToConvertRatesRequest,
    SubscribeToConvertRatesResponse,
} from '@bhft/trading_data_provider-api-sdk/index.services.trading_data_provider.v1.js';
import { isNil } from 'lodash-es';

import { TRpcRouteTransformers } from '../../../rpc/def.ts';
import { stringToDuration } from '../../../utils/grpc.ts';
import { mapRequired } from '../../../utils/mapRequired.ts';
import { assertNever } from '../../../utils/types.ts';
import { ETradingDataProviderRouteName } from '../def.ts';

export const subscribeToConvertRatesTransformers: TRpcRouteTransformers<
    ETradingDataProviderRouteName.SubscribeToConvertRates,
    SubscribeToConvertRatesRequest,
    SubscribeToConvertRatesResponse
> = {
    fromRequestToGrpc(req) {
        return {
            filters: req.payload?.filters,
            params: {
                aggregation: {
                    function: req.payload?.params?.aggregation?.function,
                    interval: !isNil(req.payload?.params?.aggregation?.interval)
                        ? stringToDuration(req.payload.params.aggregation.interval)
                        : undefined,
                },
            },
        };
    },
    fromGrpcToResponse(res) {
        switch (res.response?.$case) {
            case 'subscribed': {
                return {
                    type: 'ConvertRatesSubscribed',
                    token: res.response.subscribed.token,
                };
            }
            case 'updated': {
                return {
                    type: 'ConvertRatesUpdated',
                    updates: mapRequired(res.response.updated.updates),
                };
            }
            case 'removed': {
                return {
                    type: 'ConvertRatesRemoved',
                    keys: mapRequired(res.response.removed.keys),
                };
            }
            default: {
                assertNever(res.response as never);
            }
        }
    },
};
