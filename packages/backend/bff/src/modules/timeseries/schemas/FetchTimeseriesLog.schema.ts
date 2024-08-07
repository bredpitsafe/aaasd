import type { Assign } from '@common/types';
import type {
    TFetchTimeseriesLogRequest,
    TFetchTimeseriesLogResponse,
} from '@grpc-schemas/trading_data_provider-api-sdk/services/trading_data_provider/v1/timeseries_api.d.ts';

import type { WithMock } from '../../../def/mock.ts';
import type { WithRequestStage } from '../../../def/stages.ts';

/** @public */
export type TFetchTimeseriesLogRequestPayload = WithMock<
    WithRequestStage<
        Assign<
            TFetchTimeseriesLogRequest,
            {
                type: 'FetchTimeseriesLog';
            }
        >
    >
>;

/** @public */
export type TFetchTimeseriesLogResponsePayload = {
    type: 'Snapshot';
} & TFetchTimeseriesLogResponse;
