import type { Assign } from '@common/types';
import type {
    TSubscribeToPolicySnapshotRequest,
    TSubscribeToPolicySnapshotResponseOk,
    TSubscribeToPolicySnapshotResponseSnapshot,
    TSubscribeToPolicySnapshotResponseUpdates,
} from '@grpc-schemas/authorization-api-sdk/services/authorization/v1/policy_api.js';
export type {
    TPolicy,
    TPolicyFilterFilter,
} from '@grpc-schemas/authorization-api-sdk/services/authorization/v1/policy_api.js';

import type { WithMock } from '../../../def/mock.ts';

export type TSubscribeToPolicySnapshotRequestPayload = WithMock<
    Assign<
        TSubscribeToPolicySnapshotRequest,
        {
            type: 'SubscribeToPolicySnapshot';
        }
    >
>;

/** @public */
export type TSubscribeToPolicySnapshotResponseSubscribedPayload = {
    type: 'Ok';
} & TSubscribeToPolicySnapshotResponseOk;

/** @public */
export type TSubscribeToPolicySnapshotResponseSnapshotPayload = {
    type: 'Snapshot';
    snapshot: TSubscribeToPolicySnapshotResponseSnapshot['entities'];
    total?: number;
};

/** @public */
export type TSubscribeToPolicySnapshotResponseUpdatesPayload = {
    type: 'Updates';
    upserted?: TSubscribeToPolicySnapshotResponseUpdates['upserted'];
    removed?: TSubscribeToPolicySnapshotResponseUpdates['removed'];
    total?: number;
};

export type TSubscribeToPolicySnapshotResponsePayload =
    | TSubscribeToPolicySnapshotResponseSubscribedPayload
    | TSubscribeToPolicySnapshotResponseSnapshotPayload
    | TSubscribeToPolicySnapshotResponseUpdatesPayload;
