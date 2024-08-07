import type { Assign } from '@common/types';
import type {
    TApproveInstrumentRequest,
    TApproveInstrumentResponse,
} from '@grpc-schemas/instruments-api-sdk/services/instruments/v1/instrument_api.js';

import type { WithMock } from '../../../def/mock.ts';

export type TApproveInstrumentRequestPayload = WithMock<
    Assign<
        TApproveInstrumentRequest,
        {
            type: 'ApproveInstrument';
        }
    >
>;

/** @public */
export type TApproveInstrumentResponsePayload = Assign<
    TApproveInstrumentResponse,
    {
        type: 'InstrumentApproved';
    }
>;
