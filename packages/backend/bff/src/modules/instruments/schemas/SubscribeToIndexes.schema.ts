import type { Assign } from '@common/types';
import type {
    TSubscribeToIndexesRequest,
    TSubscribeToIndexesResponseOk,
    TSubscribeToIndexesResponseSnapshot,
    TSubscribeToIndexesResponseUpdates,
} from '@grpc-schemas/instruments-api-sdk/services/instruments/v1/index_api.js';

import type { WithMock } from '../../../def/mock.ts';

export type TSubscribeToIndexesRequestPayload = WithMock<
    Assign<
        TSubscribeToIndexesRequest,
        {
            type: 'SubscribeToIndexes';
        }
    >
>;

/** @public */
export type TSubscribeToIndexesResponseSubscribedPayload = {
    type: 'Ok';
} & TSubscribeToIndexesResponseOk;

/** @public */
export type TSubscribeToIndexesResponseSnapshotPayload = {
    type: 'Snapshot';
    snapshot: TSubscribeToIndexesResponseSnapshot['entities'];
    total?: number;
    platformTime?: TSubscribeToIndexesResponseSnapshot['platformTime'];
};

/** @public */
export type TSubscribeToIndexesResponseUpdatesPayload = {
    type: 'Updates';
    upserted?: TSubscribeToIndexesResponseUpdates['upserted'];
    removed?: TSubscribeToIndexesResponseUpdates['removed'];
    total?: number;
};

export type TSubscribeToIndexesResponsePayload =
    | TSubscribeToIndexesResponseSubscribedPayload
    | TSubscribeToIndexesResponseSnapshotPayload
    | TSubscribeToIndexesResponseUpdatesPayload;
