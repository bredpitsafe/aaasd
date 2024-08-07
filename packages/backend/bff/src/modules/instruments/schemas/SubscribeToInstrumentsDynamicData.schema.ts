import type { Assign } from '@common/types';
import type {
    TSubscribeToInstrumentsDynamicDataRequest,
    TSubscribeToInstrumentsDynamicDataResponseOk,
    TSubscribeToInstrumentsDynamicDataResponseSnapshot,
    TSubscribeToInstrumentsDynamicDataResponseUpdates,
} from '@grpc-schemas/instruments-api-sdk/services/instruments/v1/instrument_api.js';

import type { WithMock } from '../../../def/mock.ts';

export type TSubscribeToInstrumentsDynamicDataRequestPayload = WithMock<
    Assign<
        TSubscribeToInstrumentsDynamicDataRequest,
        {
            type: 'SubscribeToInstrumentsDynamicData';
        }
    >
>;

/** @public */
export type TSubscribeToInstrumentsDynamicDataResponseSubscribedPayload = {
    type: 'Ok';
} & TSubscribeToInstrumentsDynamicDataResponseOk;

/** @public */
export type TSubscribeToInstrumentsDynamicDataResponseSnapshotPayload = {
    type: 'Snapshot';
    snapshot: TSubscribeToInstrumentsDynamicDataResponseSnapshot['entities'];
    total?: number;
    platformTime?: TSubscribeToInstrumentsDynamicDataResponseSnapshot['platformTime'];
};

/** @public */
export type TSubscribeToInstrumentsDynamicDataResponseUpdatesPayload = {
    type: 'Updates';
    upserted?: TSubscribeToInstrumentsDynamicDataResponseUpdates['upserted'];
    removed?: TSubscribeToInstrumentsDynamicDataResponseUpdates['removed'];
    total?: number;
};

export type TSubscribeToInstrumentsDynamicDataResponsePayload =
    | TSubscribeToInstrumentsDynamicDataResponseSubscribedPayload
    | TSubscribeToInstrumentsDynamicDataResponseSnapshotPayload
    | TSubscribeToInstrumentsDynamicDataResponseUpdatesPayload;
