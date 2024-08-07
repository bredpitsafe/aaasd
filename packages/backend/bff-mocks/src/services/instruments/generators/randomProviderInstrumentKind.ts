import { faker } from '@faker-js/faker';
import type {
    TProviderInstrumentDetails,
    TProviderInstrumentDetailsFuturesPayoutNotation,
    TProviderInstrumentDetailsMarginNotation,
    TProviderInstrumentDetailsNotional,
    TProviderInstrumentDetailsSettlementType,
    TProviderInstrumentDetailsUnderlying,
} from '@grpc-schemas/instruments-api-sdk/services/instruments/v1/instrument_api.js';

export const randomProviderInstrumentKind = (): TProviderInstrumentDetails['kind'] => {
    return faker.helpers.arrayElement([
        {
            type: 'instantSpot',
            instantSpot: {
                baseAssetName: faker.finance.currencyName(),
                quoteAssetName: faker.finance.currencyName(),
            },
        },
        {
            type: 'spotDetails',
            spotDetails: {
                baseAssetName: faker.finance.currencyName(),
                quoteAssetName: faker.finance.currencyName(),
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
                buyInstrumentName: faker.finance.currencyName(),
                sellInstrumentName: faker.finance.currencyName(),
            },
        },
    ]);
};

const randomSettlementType = (): TProviderInstrumentDetailsSettlementType => ({
    value: faker.helpers.arrayElement([
        {
            type: 'financiallySettled',
            financiallySettled: {
                assetName: faker.finance.currencyName(),
            },
        },
        {
            type: 'physicallyDelivered',
            physicallyDelivered: {
                assetName: faker.finance.currencyName(),
                assetsPerContract: faker.number.int(),
            },
        },
        {
            type: 'exercisesIntoInstrument',
            exercisesIntoInstrument: {
                instrumentName: faker.finance.currencyName(),
                instrumentsPerContract: faker.number.int(),
            },
        },
    ]),
});

const randomNotional = (): TProviderInstrumentDetailsNotional => ({
    value: faker.helpers.arrayElement([
        {
            type: 'asset',
            asset: {
                assetName: faker.finance.currencyName(),
                assetsPerContract: faker.number.int(),
            },
        },
        {
            type: 'instrument',
            instrument: {
                instrumentName: faker.finance.currencyName(),
                instrumentsPerContract: faker.number.int(),
            },
        },
        {
            type: 'priceProportional',
            priceProportional: {
                factor: faker.number.int(),
                notationAssetName: faker.finance.currencyName(),
                priceSource: {
                    value: faker.helpers.arrayElement([
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
            },
        },
    ]),
});
const randomUnderlying = (): TProviderInstrumentDetailsUnderlying => ({
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
});

const randomPayoutNotation = (): TProviderInstrumentDetailsFuturesPayoutNotation => ({
    payoutUnit: {
        value: {
            type: 'assetName',
            assetName: faker.finance.currencyName(),
        },
    },
    payoutFunction: faker.helpers.arrayElement([
        'FUTURES_PAYOUT_FUNCTION_UNSPECIFIED',
        'FUTURES_PAYOUT_FUNCTION_NOTIONAL_VALUE',
        'FUTURES_PAYOUT_FUNCTION_PRICE_BY_NOTATION_VALUE',
        'FUTURES_PAYOUT_FUNCTION_NEG_RATIO_OF_NOTIONAL_TO_PRICE',
    ]),
});

const randomMarginNotation = (): TProviderInstrumentDetailsMarginNotation => ({
    value: {
        type: 'assetName',
        assetName: faker.finance.currencyName(),
    },
});
