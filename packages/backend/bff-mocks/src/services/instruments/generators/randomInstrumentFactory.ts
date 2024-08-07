import { faker } from '@faker-js/faker';
import type {
    TInstrument,
    TInstrumentReductionError,
} from '@grpc-schemas/instruments-api-sdk/services/instruments/v1/instrument_api.js';

import { randomInstrumentAmountNotation } from './randomInstrumentAmountNotation.ts';
import { randomInstrumentKind } from './randomInstrumentKind.ts';
import { randomInstrumentPriceNotation } from './randomInstrumentPriceNotation.ts';
import { randomProviderInstrument } from './randomProviderInstrument.ts';

export function randomInstrumentFactory() {
    let prevId = 0;

    return (): TInstrument => {
        const kind = randomInstrumentKind();
        return {
            id: prevId++,
            name: faker.finance.currencyCode() + '_' + faker.finance.currencyCode(),
            exchange: faker.company.name(),
            approvalStatus: faker.helpers.arrayElement([
                'INSTRUMENT_APPROVAL_STATUS_UNREDUCED',
                'INSTRUMENT_APPROVAL_STATUS_UNAPPROVED',
                'INSTRUMENT_APPROVAL_STATUS_APPROVED',
                'INSTRUMENT_APPROVAL_STATUS_BLOCKED',
                'INSTRUMENT_APPROVAL_STATUS_UNREDUCED_AFTER_APPROVAL',
            ]),
            kind,
            amountNotation: randomInstrumentAmountNotation(),
            priceNotation: randomInstrumentPriceNotation(),
            user: faker.internet.userName(),
            platformTime: faker.date.recent().toISOString(),
            providerInstruments: faker.helpers.multiple(randomProviderInstrument, {
                count: {
                    min: 1,
                    max: 10,
                },
            }),
            instrumentReductionErrors: faker.helpers.multiple(() => randomReductionError(kind), {
                count: {
                    min: 1,
                    max: 4,
                },
            }),
        };
    };
}

const randomReductionError = (kind: TInstrument['kind']): TInstrumentReductionError => {
    let reductionKindError: TInstrumentReductionError['fieldPath'] | undefined = undefined;
    switch (kind?.type) {
        case 'instantSpot': {
            reductionKindError = [
                'kind',
                kind.type,
                faker.helpers.arrayElement(Object.keys(kind[kind.type])),
            ];
            break;
        }
        case 'spotDetails': {
            reductionKindError = [
                'kind',
                kind.type,
                faker.helpers.arrayElement(Object.keys(kind[kind.type])),
            ];
            break;
        }
        case 'futuresDetails': {
            reductionKindError = ['kind', kind.type, 'underlying', 'value', 'type'];
            break;
        }
        case 'perpFutures': {
            reductionKindError = [
                'kind',
                kind.type,
                'payoutUnit',
                'payoutUnit',
                'value',
                'assetId',
            ];
            break;
        }
        default: {
            reductionKindError = ['user'];
        }
    }

    return {
        fieldPath: faker.helpers.arrayElement([
            ['name'],
            ['approvalStatus'],
            ['amountNotation', 'value', 'type'],
            [
                'priceNotation',
                'value',
                'ratio',
                faker.helpers.arrayElement(['numerator', 'denominator']),
                'value',
                'type',
            ],
            reductionKindError,
        ]),
        message: faker.lorem.sentence(),
    };
};
