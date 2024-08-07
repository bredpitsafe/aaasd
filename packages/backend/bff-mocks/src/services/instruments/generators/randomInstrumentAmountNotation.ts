import { faker } from '@faker-js/faker';
import type { TInstrumentAmountNotation } from '@grpc-schemas/instruments-api-sdk/services/instruments/v1/instrument_api.js';

export const randomInstrumentAmountNotation = (): TInstrumentAmountNotation => {
    return faker.helpers.arrayElement([
        {
            value: {
                type: 'asset',
                asset: {
                    assetId: faker.number.int(),
                    multiplier: faker.number.int({ min: 0, max: 100 }),
                },
            },
        },
        {
            value: {
                type: 'instrument',
                instrument: {
                    instrumentId: faker.number.int(),
                    multiplier: faker.number.int({ min: 0, max: 100 }),
                },
            },
        },
    ]);
};
