import type { Assign } from '@common/types';
import type {
    TSubscribeToInstrumentsRequest,
    TSubscribeToInstrumentsResponseOk,
    TSubscribeToInstrumentsResponseSnapshot,
    TSubscribeToInstrumentsResponseUpdates,
} from '@grpc-schemas/instruments-api-sdk/services/instruments/v1/instrument_api.js';

import type { WithMock } from '../../../def/mock.ts';

/** @public */
export type TSubscribeToInstrumentsRequestPayload = WithMock<
    Assign<
        TSubscribeToInstrumentsRequest,
        {
            type: 'SubscribeToInstruments';
        }
    >
>;

/** @public */
export type TSubscribeToInstrumentsResponseSubscribedPayload = {
    type: 'Ok';
} & TSubscribeToInstrumentsResponseOk;

/** @public */
export type TSubscribeToInstrumentsResponseSnapshotPayload = {
    type: 'Snapshot';
    snapshot: TSubscribeToInstrumentsResponseSnapshot['entities'];
    total?: number;
    platformTime?: TSubscribeToInstrumentsResponseSnapshot['platformTime'];
};

/** @public */
export type TSubscribeToInstrumentsResponseUpdatesPayload = {
    type: 'Updates';
    upserted?: TSubscribeToInstrumentsResponseUpdates['upserted'];
    removed?: TSubscribeToInstrumentsResponseUpdates['removed'];
    total?: number;
};

/** @public */
export type TSubscribeToInstrumentsResponsePayload =
    | TSubscribeToInstrumentsResponseSubscribedPayload
    | TSubscribeToInstrumentsResponseSnapshotPayload
    | TSubscribeToInstrumentsResponseUpdatesPayload;
