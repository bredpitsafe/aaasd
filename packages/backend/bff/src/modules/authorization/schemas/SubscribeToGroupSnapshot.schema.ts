import type { Assign } from '@common/types';
import type {
    TSubscribeToGroupSnapshotRequest,
    TSubscribeToGroupSnapshotResponseOk,
    TSubscribeToGroupSnapshotResponseSnapshot,
    TSubscribeToGroupSnapshotResponseUpdates,
} from '@grpc-schemas/authorization-api-sdk/services/authorization/v1/group_api.js';
export type {
    TGroup,
    TGroupFilter,
} from '@grpc-schemas/authorization-api-sdk/services/authorization/v1/group_api.js';

import type { WithMock } from '../../../def/mock.ts';

export type TSubscribeToGroupSnapshotRequestPayload = WithMock<
    Assign<
        TSubscribeToGroupSnapshotRequest,
        {
            type: 'SubscribeToGroupSnapshot';
        }
    >
>;

/** @public */
export type TSubscribeToGroupSnapshotResponseSubscribedPayload = {
    type: 'Ok';
} & TSubscribeToGroupSnapshotResponseOk;

/** @public */
export type TSubscribeToGroupSnapshotResponseSnapshotPayload = {
    type: 'Snapshot';
    snapshot: TSubscribeToGroupSnapshotResponseSnapshot['entities'];
    total?: number;
};

/** @public */
export type TSubscribeToGroupSnapshotResponseUpdatesPayload = {
    type: 'Updates';
    upserted?: TSubscribeToGroupSnapshotResponseUpdates['upserted'];
    removed?: TSubscribeToGroupSnapshotResponseUpdates['removed'];
    total?: number;
};

export type TSubscribeToGroupSnapshotResponsePayload =
    | TSubscribeToGroupSnapshotResponseSubscribedPayload
    | TSubscribeToGroupSnapshotResponseSnapshotPayload
    | TSubscribeToGroupSnapshotResponseUpdatesPayload;
