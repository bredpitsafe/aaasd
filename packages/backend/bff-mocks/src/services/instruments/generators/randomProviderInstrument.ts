import { faker } from '@faker-js/faker';
import type {
    TProviderInstrument,
    TProviderInstrumentSource,
} from '@grpc-schemas/instruments-api-sdk/index.services.instruments.v1';

import { randomProviderInstrumentDetails } from './randomProviderInstrumentDetails.ts';

export const randomProviderInstrument = (): TProviderInstrument => {
    const base = faker.finance.currencyCode();
    const quote = faker.finance.currencyCode();
    const name = base + '_' + quote;
    const source: TProviderInstrumentSource = faker.helpers.arrayElement([
        'SOURCE_TRANSFORMED',
        'SOURCE_OVERRIDE',
    ]);

    return {
        source,
        name: name,
        platformTime: faker.date.soon({ refDate: '2023-01-01T00:00:00.000Z' }).toISOString(),
        details: randomProviderInstrumentDetails(),
        provider: faker.company.name(),
    };
};
