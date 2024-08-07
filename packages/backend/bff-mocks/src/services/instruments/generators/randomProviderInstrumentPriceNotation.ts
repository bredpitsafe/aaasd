import { faker } from '@faker-js/faker';
import type { TProviderInstrumentDetailsPriceNotation } from '@grpc-schemas/instruments-api-sdk/services/instruments/v1/instrument_api.js';

export const randomProviderInstrumentPriceNotation =
    (): TProviderInstrumentDetailsPriceNotation => {
        return faker.helpers.arrayElement([
            {
                value: {
                    type: 'ratio',
                    ratio: {
                        numerator: {
                            value: faker.helpers.arrayElement([
                                {
                                    type: 'assetName',
                                    assetName: faker.finance.currencyName(),
                                },
                                {
                                    type: 'instrumentName',
                                    instrumentName: faker.finance.currencyName(),
                                },
                                {
                                    type: 'indexName',
                                    indexName: faker.finance.currencyName(),
                                },
                            ]),
                        },
                        denominator: {
                            value: faker.helpers.arrayElement([
                                {
                                    type: 'assetName',
                                    assetName: faker.finance.currencyName(),
                                },
                                {
                                    type: 'instrumentName',
                                    instrumentName: faker.finance.currencyName(),
                                },
                                {
                                    type: 'indexName',
                                    indexName: faker.finance.currencyName(),
                                },
                            ]),
                        },
                        denominatorMultiplier: faker.number.int({ min: 0, max: 100 }),
                    },
                },
            },
        ]);
    };
