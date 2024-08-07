import type { Assign } from '@common/types';
import type {
    TUpdateProviderInstrumentsOverrideRequest,
    TUpdateProviderInstrumentsOverrideResponse,
} from '@grpc-schemas/instruments-api-sdk/services/instruments/v1/instrument_api.js';

import type { WithMock } from '../../../def/mock.ts';

export type TUpdateProviderInstrumentsOverrideRequestPayload = WithMock<
    Assign<
        TUpdateProviderInstrumentsOverrideRequest,
        {
            type: 'UpdateProviderInstrumentsOverride';
        }
    >
>;

/** @public */
export type TUpdateProviderInstrumentsOverrideResponsePayload = Assign<
    TUpdateProviderInstrumentsOverrideResponse,
    {
        type: 'ProviderInstrumentsOverridden';
    }
>;
