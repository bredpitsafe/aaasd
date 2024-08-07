import type { Assign } from '@common/types';
import type {
    TSubscribeToAssetsRequest,
    TSubscribeToAssetsResponseOk,
    TSubscribeToAssetsResponseSnapshot,
    TSubscribeToAssetsResponseUpdates,
} from '@grpc-schemas/instruments-api-sdk/services/instruments/v1/asset_api.js';

import type { WithMock } from '../../../def/mock.ts';

export type TSubscribeToAssetsRequestPayload = WithMock<
    Assign<
        TSubscribeToAssetsRequest,
        {
            type: 'SubscribeToAssets';
        }
    >
>;

/** @public */
export type TSubscribeToAssetsResponseSubscribedPayload = {
    type: 'Ok';
} & TSubscribeToAssetsResponseOk;

/** @public */
export type TSubscribeToAssetsResponseSnapshotPayload = {
    type: 'Snapshot';
    snapshot: TSubscribeToAssetsResponseSnapshot['entities'];
    total?: number;
    platformTime?: TSubscribeToAssetsResponseSnapshot['platformTime'];
};

/** @public */
export type TSubscribeToAssetsResponseUpdatesPayload = {
    type: 'Updates';
    upserted?: TSubscribeToAssetsResponseUpdates['upserted'];
    removed?: TSubscribeToAssetsResponseUpdates['removed'];
    total?: number;
};

export type TSubscribeToAssetsResponsePayload =
    | TSubscribeToAssetsResponseSubscribedPayload
    | TSubscribeToAssetsResponseSnapshotPayload
    | TSubscribeToAssetsResponseUpdatesPayload;
