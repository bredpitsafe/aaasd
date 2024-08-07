import { faker } from '@faker-js/faker';
import type {
    TInstrument,
    TInstrumentFuturesPayoutNotation,
    TInstrumentMarginNotation,
    TInstrumentNotional,
    TInstrumentSettlementType,
    TInstrumentUnderlying,
} from '@grpc-schemas/instruments-api-sdk/services/instruments/v1/instrument_api.js';

export const randomInstrumentKind = (): TInstrument['kind'] => {
    return faker.helpers.arrayElement([
        {
            type: 'instantSpot',
            instantSpot: {
                baseAssetId: faker.number.int(),
                quoteAssetId: faker.number.int(),
            },
        },
        {
            type: 'spotDetails',
            spotDetails: {
                baseAssetId: faker.number.int(),
                quoteAssetId: faker.number.int(),
                settlementTime: faker.date.future().toISOString(),
                settlementType: randomSettlementType(),
            },
        },
        {
            type: 'futuresDetails',
            futuresDetails: {
                notional: randomNotional(),
                underlying: randomUnderlying(),
                payoutNotation: randomPayoutNotation(),
                marginNotation: randomMarginNotation(),
                startTime: faker.date.past().toISOString(),
                expirationTime: faker.date.future().toISOString(),
                settlementTime: faker.date.future().toISOString(),
                settlementType: randomSettlementType(),
            },
        },
        {
            type: 'perpFutures',
            perpFutures: {
                notional: randomNotional(),
                underlying: randomUnderlying(),
                payoutNotation: randomPayoutNotation(),
                marginNotation: randomMarginNotation(),
            },
        },
        {
            type: 'option',
            option: {
                notional: randomNotional(),
                underlying: randomUnderlying(),
                marginNotation: randomMarginNotation(),
                startTime: faker.date.past().toISOString(),
                expirationTime: faker.date.future().toISOString(),
                settlementTime: faker.date.future().toISOString(),
                settlementType: randomSettlementType(),
                collateralizingType: faker.helpers.arrayElement([
                    'OPTION_COLLATERALIZING_TYPE_UNSPECIFIED',
                    'OPTION_COLLATERALIZING_TYPE_PREMIUM',
                    'OPTION_COLLATERALIZING_TYPE_MARGINED',
                ]),
                optionType: faker.helpers.arrayElement([
                    'OPTION_TYPE_UNSPECIFIED',
                    'OPTION_TYPE_PUT',
                    'OPTION_TYPE_CALL',
                ]),
                optionStyle: {
                    value: faker.helpers.arrayElement([
                        {
                            type: 'european',
                            european: { settlementTime: faker.date.future().toISOString() },
                        },
                        {
                            type: 'american',
                            american: {},
                        },
                    ]),
                },
                strikePrice: faker.number.float(),
            },
        },
        {
            type: 'instrumentSwap',
            instrumentSwap: {
                buyInstrumentId: faker.number.int(),
                sellInstrumentId: faker.number.int(),
            },
        },
    ]);
};

const randomSettlementType = (): TInstrumentSettlementType => ({
    value: faker.helpers.arrayElement([
        {
            type: 'financiallySettled',
            financiallySettled: {
                assetId: faker.number.int(),
            },
        },
        {
            type: 'physicallyDelivered',
            physicallyDelivered: {
                assetId: faker.number.int(),
                assetsPerContract: faker.number.int(),
            },
        },
        {
            type: 'exercisesIntoInstrument',
            exercisesIntoInstrument: {
                instrumentId: faker.number.int(),
                instrumentsPerContract: faker.number.int(),
            },
        },
    ]),
});

const randomNotional = (): TInstrumentNotional => ({
    value: faker.helpers.arrayElement([
        {
            type: 'asset',
            asset: {
                assetId: faker.number.int(),
                assetsPerContract: faker.number.int(),
            },
        },
        {
            type: 'instrument',
            instrument: {
                instrumentId: faker.number.int(),
                instrumentsPerContract: faker.number.int(),
            },
        },
        {
            type: 'priceProportional',
            priceProportional: {
                factor: faker.number.int(),
                notationAssetId: faker.number.int(),
                priceSource: {
                    value: faker.helpers.arrayElement([
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
            },
        },
    ]),
});
const randomUnderlying = (): TInstrumentUnderlying => ({
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
});

const randomPayoutNotation = (): TInstrumentFuturesPayoutNotation => ({
    payoutUnit: {
        value: {
            type: 'assetId',
            assetId: faker.number.int(),
        },
    },
    payoutFunction: faker.helpers.arrayElement([
        'FUTURES_PAYOUT_FUNCTION_UNSPECIFIED',
        'FUTURES_PAYOUT_FUNCTION_NOTIONAL_VALUE',
        'FUTURES_PAYOUT_FUNCTION_PRICE_BY_NOTATION_VALUE',
        'FUTURES_PAYOUT_FUNCTION_NEG_RATIO_OF_NOTIONAL_TO_PRICE',
    ]),
});

const randomMarginNotation = (): TInstrumentMarginNotation => ({
    value: {
        type: 'assetId',
        assetId: faker.number.int(),
    },
});
