import { assert, assertNever } from '@common/utils';
import type {
    TSubscribeToConvertRatesRequest,
    TSubscribeToConvertRatesResponse,
} from '@grpc-schemas/trading_data_provider-api-sdk/index.services.trading_data_provider.v1.js';
import { isNil } from 'lodash-es';

import type { TRpcRouteTransformers } from '../../../rpc/def.ts';
import { stringToDuration } from '../../../utils/grpc.ts';
import { mapRequired } from '../../../utils/mapRequired.ts';
import type { ETradingDataProviderRouteName } from '../def.ts';

export const subscribeToConvertRatesTransformers: TRpcRouteTransformers<
    ETradingDataProviderRouteName.SubscribeToConvertRates,
    TSubscribeToConvertRatesRequest,
    TSubscribeToConvertRatesResponse
> = {
    fromRequestToGrpc(req) {
        return {
            filters: req.payload?.filters,
            params: {
                // TODO: Check that params, they were optional before
                aggregation: {
                    function: req.payload.params.aggregation?.function,
                    interval: stringToDuration(req.payload.params.aggregation.interval),
                },
            },
        };
    },
    fromGrpcToResponse({ response }) {
        assert(!isNil(response), `Response can't be empty`);

        switch (response.type) {
            case 'subscribed': {
                return {
                    type: 'ConvertRatesSubscribed',
                    deduplicationToken: response.subscribed.deduplicationToken,
                };
            }
            case 'updated': {
                return {
                    type: 'ConvertRatesUpdated',
                    updates: mapRequired(response.updated.updates),
                };
            }
            case 'removed': {
                return {
                    type: 'ConvertRatesRemoved',
                    keys: mapRequired(response.removed.keys),
                };
            }
            default: {
                assertNever(response);
            }
        }
    },
};
