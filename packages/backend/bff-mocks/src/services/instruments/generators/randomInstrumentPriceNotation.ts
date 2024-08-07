import { faker } from '@faker-js/faker';
import type { TInstrumentPriceNotation } from '@grpc-schemas/instruments-api-sdk/services/instruments/v1/instrument_api.js';

export const randomInstrumentPriceNotation = (): TInstrumentPriceNotation => {
    return faker.helpers.arrayElement([
        {
            value: {
                type: 'ratio',
                ratio: {
                    numerator: {
                        value: faker.helpers.arrayElement([
                            {
                                type: 'assetId',
                                assetId: faker.number.int(),
                            },
                            {
                                type: 'instrumentId',
                                instrumentId: faker.number.int(),
                            },
                            {
                                type: 'indexId',
                                indexId: faker.number.int(),
                            },
                        ]),
                    },
                    denominator: {
                        value: faker.helpers.arrayElement([
                            {
                                type: 'assetId',
                                assetId: faker.number.int(),
                            },
                            {
                                type: 'instrumentId',
                                instrumentId: faker.number.int(),
                            },
                            {
                                type: 'indexId',
                                indexId: faker.number.int(),
                            },
                        ]),
                    },
                    denominatorMultiplier: faker.number.int({ min: 0, max: 100 }),
                },
            },
        },
    ]);
};
