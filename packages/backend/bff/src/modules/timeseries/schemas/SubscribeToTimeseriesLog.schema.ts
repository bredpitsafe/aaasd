import type { Assign } from '@common/types';
import type {
    TSubscribedToTimeseries,
    TSubscribeToTimeseriesLogRequest,
    TSubscribeToTimeseriesLogResponseTimeseriesRemoved,
    TSubscribeToTimeseriesLogResponseTimeseriesUpdated,
} from '@grpc-schemas/trading_data_provider-api-sdk/services/trading_data_provider/v1/timeseries_api.d.ts';

import type { WithMock } from '../../../def/mock.ts';
import type { WithRequestStage } from '../../../def/stages.ts';

/** @public */
export type TSubscribeToTimeseriesLogRequestPayload = WithMock<
    WithRequestStage<
        Assign<
            TSubscribeToTimeseriesLogRequest,
            {
                type: 'SubscribeToTimeseriesLog';
            }
        >
    >
>;

/** @public */
export type TSubscribeToTimeseriesLogResponseSubscribedPayload = {
    type: 'Ok';
} & TSubscribedToTimeseries;

/** @public */
export type TSubscribeToTimeseriesLogResponseUpdatesPayload = {
    type: 'Updates';
    upserted?: TSubscribeToTimeseriesLogResponseTimeseriesUpdated['timeseries'];
    removed?: TSubscribeToTimeseriesLogResponseTimeseriesRemoved['entities'];
};

/** @public */
export type TSubscribeToTimeseriesLogResponsePayload =
    | TSubscribeToTimeseriesLogResponseSubscribedPayload
    | TSubscribeToTimeseriesLogResponseUpdatesPayload;
