import type { Assign } from '@common/types';
import type {
    TFetchInstrumentRevisionsLogRequest,
    TFetchInstrumentRevisionsLogResponse,
} from '@grpc-schemas/instruments-api-sdk/services/instruments/v1/instrument_api.js';

import type { WithMock } from '../../../def/mock.ts';

export type TFetchInstrumentRevisionsLogRequestPayload = WithMock<
    Assign<
        TFetchInstrumentRevisionsLogRequest,
        {
            type: 'FetchInstrumentRevisionsLog';
        }
    >
>;

/** @public */
export type TFetchInstrumentRevisionsLogResponsePayload = {
    type: 'Snapshot';
    snapshot: TFetchInstrumentRevisionsLogResponse['entities'];
};
