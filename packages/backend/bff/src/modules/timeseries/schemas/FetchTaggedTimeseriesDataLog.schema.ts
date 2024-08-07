import type { Assign } from '@common/types';
import type {
    TFetchTaggedTimeseriesDataLogRequest,
    TFetchTaggedTimeseriesDataLogResponse,
} from '@grpc-schemas/trading_data_provider-api-sdk/services/trading_data_provider/v1/timeseries_api.d.ts';

import type { WithMock } from '../../../def/mock.ts';
import type { WithRequestStage } from '../../../def/stages.ts';

/** @public */
export type TFetchTaggedTimeseriesDataLogRequestPayload = WithMock<
    WithRequestStage<
        Assign<
            TFetchTaggedTimeseriesDataLogRequest,
            {
                type: 'FetchTaggedTimeseriesDataLog';
            }
        >
    >
>;

/** @public */
export type TFetchTaggedTimeseriesDataLogResponsePayload = {
    type: 'Snapshot';
} & TFetchTaggedTimeseriesDataLogResponse;
