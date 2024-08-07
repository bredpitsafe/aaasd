import { faker } from '@faker-js/faker';
import type { TProviderInstrumentDetailsAmountNotation } from '@grpc-schemas/instruments-api-sdk/services/instruments/v1/instrument_api.js';

export const randomProviderInstrumentAmountNotation =
    (): TProviderInstrumentDetailsAmountNotation => {
        return faker.helpers.arrayElement([
            {
                value: {
                    type: 'asset',
                    asset: {
                        assetName: faker.finance.currencyName(),
                        multiplier: faker.number.int({ min: 0, max: 100 }),
                    },
                },
            },
            {
                value: {
                    type: 'instrument',
                    instrument: {
                        instrumentName: faker.finance.currencyName(),
                        multiplier: faker.number.int({ min: 0, max: 100 }),
                    },
                },
            },
        ]);
    };
