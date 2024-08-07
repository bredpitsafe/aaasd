import type { TProviderInstrumentDetails } from '@grpc-schemas/instruments-api-sdk/services/instruments/v1/instrument_api.js';

import { randomProviderInstrumentAmountNotation } from './randomProviderInstrumentAmountNotation.ts';
import { randomProviderInstrumentKind } from './randomProviderInstrumentKind.ts';
import { randomProviderInstrumentPriceNotation } from './randomProviderInstrumentPriceNotation.ts';

export const randomProviderInstrumentDetails = (): TProviderInstrumentDetails => {
    return {
        kind: randomProviderInstrumentKind(),
        priceNotation: randomProviderInstrumentPriceNotation(),
        amountNotation: randomProviderInstrumentAmountNotation(),
    };
};
