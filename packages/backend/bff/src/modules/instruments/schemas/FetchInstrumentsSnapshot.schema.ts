import type { Assign } from '@common/types';
import type {
    TFetchInstrumentsSnapshotRequest,
    TFetchInstrumentsSnapshotResponse,
} from '@grpc-schemas/instruments-api-sdk/services/instruments/v1/instrument_api.js';

import type { WithMock } from '../../../def/mock.ts';

export type TFetchInstrumentsSnapshotRequestPayload = WithMock<
    Assign<
        TFetchInstrumentsSnapshotRequest,
        {
            type: 'FetchInstrumentsSnapshot';
        }
    >
>;

/** @public */
export type TFetchInstrumentsSnapshotResponsePayload = {
    type: 'Snapshot';
    snapshot: TFetchInstrumentsSnapshotResponse['entities'];
    total?: number;
};
