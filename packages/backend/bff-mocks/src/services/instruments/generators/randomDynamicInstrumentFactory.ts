import { faker } from '@faker-js/faker';
import type {
    TInstrumentDynamicData,
    TInstrumentDynamicDataAmountStepRules,
    TInstrumentDynamicDataPriceStepRules,
} from '@grpc-schemas/instruments-api-sdk/services/instruments/v1/instrument_api.js';

export function randomDynamicInstrumentFactory() {
    let prevId = 0;

    return (): TInstrumentDynamicData => {
        return {
            id: prevId++,
            name: faker.finance.currencyCode() + '_' + faker.finance.currencyCode(),
            status: faker.helpers.arrayElement([
                'STATUS_UNSPECIFIED',
                'STATUS_TRADING',
                'STATUS_CANCEL_ONLY',
                'STATUS_HALTED',
                'STATUS_DELISTED',
                'STATUS_FORBIDDEN',
            ]),
            priceStepRules: randomPriceStepRules(),
            amountStepRules: randomAmountStepRules(),
            minPrice: faker.number.int({ min: 0, max: 1000 }),
            maxPrice: faker.number.int({ min: 1000, max: 1_000_000 }),
            minQty: faker.number.int({ min: 0, max: 1000 }),
            maxQty: faker.number.int({ min: 0, max: 1000 }),
            minVolume: faker.number.int({ min: 0, max: 1000 }),
            platformTime: faker.date.recent().toISOString(),
            exchange: faker.company.name(),
        };
    };
}

const randomPriceStepRules = (): TInstrumentDynamicDataPriceStepRules => {
    return {
        value: faker.helpers.arrayElement([
            { type: 'simple', simple: { priceDelta: faker.number.float() } },
            {
                type: 'table',
                table: {
                    rows: [
                        {
                            upperBoundaryPrice: 2000.0,
                            step: 10.0,
                        },
                        {
                            upperBoundaryPrice: 5000.0,
                            step: 50.0,
                        },
                        {
                            upperBoundaryPrice: undefined,
                            step: 100.0,
                        },
                    ],
                },
            },
        ]),
    };
};
const randomAmountStepRules = (): TInstrumentDynamicDataAmountStepRules => {
    return {
        value: {
            type: 'simple',
            simple: {
                value: faker.number.float(),
            },
        },
    };
};
