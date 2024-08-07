import { extractValidNumber } from '@common/utils/extract.ts';
import type {
    TFetchInstrumentsSnapshotRequest,
    TFetchInstrumentsSnapshotResponse,
} from '@grpc-schemas/instruments-api-sdk/services/instruments/v1/instrument_api.js';

import type { TRpcRouteTransformers } from '../../../rpc/def.ts';
import { mapRequired } from '../../../utils/mapRequired.ts';
import type { EInstrumentsRouteName } from '../def.ts';

export const fetchInstrumentsSnapshotTransformers: TRpcRouteTransformers<
    EInstrumentsRouteName.FetchInstrumentsSnapshot,
    TFetchInstrumentsSnapshotRequest,
    TFetchInstrumentsSnapshotResponse
> = {
    fromRequestToGrpc(req) {
        return req.payload;
    },
    fromGrpcToResponse(res) {
        return {
            type: 'Snapshot',
            snapshot: mapRequired(res.entities),
            total: extractValidNumber(res.total),
        };
    },
};
