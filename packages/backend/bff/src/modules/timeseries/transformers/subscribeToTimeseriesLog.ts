import { assert, assertNever } from '@common/utils';
import type {
    TSubscribeToTimeseriesLogRequest,
    TSubscribeToTimeseriesLogResponse,
} from '@grpc-schemas/trading_data_provider-api-sdk/services/trading_data_provider/v1/timeseries_api.d.ts';
import { isNil } from 'lodash-es';

import { ERpcSubscriptionEvent } from '../../../def/rpc.ts';
import type { TRpcRouteTransformers } from '../../../rpc/def.ts';
import type { ETimeseriesRouteName } from '../def.ts';

export const subscribeToTimeseriesLogTransformers: TRpcRouteTransformers<
    ETimeseriesRouteName.SubscribeToTimeseriesLog,
    TSubscribeToTimeseriesLogRequest,
    TSubscribeToTimeseriesLogResponse
> = {
    fromRequestToGrpc(req) {
        return req.payload;
    },
    fromGrpcToResponse({ response }) {
        assert(!isNil(response), `Response can't be empty`);

        switch (response.type) {
            case 'subscribed': {
                return {
                    type: ERpcSubscriptionEvent.Ok,
                    ...response.subscribed,
                };
            }
            case 'removed': {
                return {
                    type: ERpcSubscriptionEvent.Updates,
                    removed: response.removed.entities,
                };
            }
            case 'updated': {
                return {
                    type: ERpcSubscriptionEvent.Updates,
                    upserted: response.updated.timeseries,
                };
            }
            default: {
                assertNever(response);
            }
        }
    },
};
