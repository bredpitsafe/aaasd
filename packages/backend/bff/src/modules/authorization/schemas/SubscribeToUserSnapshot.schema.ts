import type { Assign } from '@common/types';
import type {
    TSubscribeToUserSnapshotRequest,
    TSubscribeToUserSnapshotResponseOk,
    TSubscribeToUserSnapshotResponseSnapshot,
    TSubscribeToUserSnapshotResponseUpdates,
} from '@grpc-schemas/authorization-api-sdk/services/authorization/v1/user_api.js';
export type {
    TUser,
    TUserFilter,
} from '@grpc-schemas/authorization-api-sdk/services/authorization/v1/user_api.js';

import type { WithMock } from '../../../def/mock.ts';

export type TSubscribeToUserSnapshotRequestPayload = WithMock<
    Assign<
        TSubscribeToUserSnapshotRequest,
        {
            type: 'SubscribeToUserSnapshot';
        }
    >
>;

/** @public */
export type TSubscribeToUserSnapshotResponseSubscribedPayload = {
    type: 'Ok';
} & TSubscribeToUserSnapshotResponseOk;

/** @public */
export type TSubscribeToUserSnapshotResponseSnapshotPayload = {
    type: 'Snapshot';
    snapshot: TSubscribeToUserSnapshotResponseSnapshot['entities'];
    total?: number;
};

/** @public */
export type TSubscribeToUserSnapshotResponseUpdatesPayload = {
    type: 'Updates';
    upserted?: TSubscribeToUserSnapshotResponseUpdates['upserted'];
    removed?: TSubscribeToUserSnapshotResponseUpdates['removed'];
    total?: number;
};

export type TSubscribeToUserSnapshotResponsePayload =
    | TSubscribeToUserSnapshotResponseSubscribedPayload
    | TSubscribeToUserSnapshotResponseSnapshotPayload
    | TSubscribeToUserSnapshotResponseUpdatesPayload;
