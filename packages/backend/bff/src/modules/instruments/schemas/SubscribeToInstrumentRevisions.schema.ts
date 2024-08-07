import type { Assign } from '@common/types';
import type {
    TSubscribeToInstrumentRevisionsRequest,
    TSubscribeToInstrumentRevisionsResponseOk,
    TSubscribeToInstrumentRevisionsResponseUpdates,
} from '@grpc-schemas/instruments-api-sdk/services/instruments/v1/instrument_api.js';

import type { WithMock } from '../../../def/mock.ts';

export type TSubscribeToInstrumentRevisionsRequestPayload = WithMock<
    Assign<
        TSubscribeToInstrumentRevisionsRequest,
        {
            type: 'SubscribeToInstrumentRevisions';
        }
    >
>;

/** @public */
export type TSubscribeToInstrumentRevisionsResponseSubscribedPayload = {
    type: 'Ok';
} & TSubscribeToInstrumentRevisionsResponseOk;

/** @public */
export type TSubscribeToInstrumentRevisionsResponseUpdatesPayload = {
    type: 'Updates';
    upserted?: TSubscribeToInstrumentRevisionsResponseUpdates['upserted'];
    total?: number;
};

export type TSubscribeToInstrumentRevisionsResponsePayload =
    | TSubscribeToInstrumentRevisionsResponseSubscribedPayload
    | TSubscribeToInstrumentRevisionsResponseUpdatesPayload;
