import type {
    TInstrument,
    TProviderInstrumentDetails,
    TProviderInstrumentDetailsAmountNotation,
    TProviderInstrumentDetailsFuturesDetails,
    TProviderInstrumentDetailsFuturesPayoutNotation,
    TProviderInstrumentDetailsFuturesPayoutNotationFuturesPayoutFunction,
    TProviderInstrumentDetailsInstantSpotDetails,
    TProviderInstrumentDetailsInstrumentSwapDetails,
    TProviderInstrumentDetailsMarginNotation,
    TProviderInstrumentDetailsNotional,
    TProviderInstrumentDetailsOptionCollateralizingType,
    TProviderInstrumentDetailsOptionDetails,
    TProviderInstrumentDetailsOptionStyle,
    TProviderInstrumentDetailsOptionType,
    TProviderInstrumentDetailsPerpFuturesDetails,
    TProviderInstrumentDetailsPriceNotation,
    TProviderInstrumentDetailsPriceNotationRatioPriceNotationUnit,
    TProviderInstrumentDetailsSettlementType,
    TProviderInstrumentDetailsSpotDetails,
    TProviderInstrumentDetailsUnderlying,
} from '@backend/bff/src/modules/instruments/schemas/defs';
import type { ISO, TimeZone } from '@common/types';
import { EDateTimeFormats } from '@common/types';
import { toDayjsWithTimezone } from '@common/utils';
import { assertNever } from '@common/utils/src/assert.ts';
import type {
    ColDef,
    RowClassParams,
    RowClassRules,
    ValueFormatterFunc,
    ValueFormatterParams,
} from '@frontend/ag-grid';
import { isEmpty, isNil, isString } from 'lodash-es';

import type {
    TEditablePropertyCell,
    TOverrideProviderInstrument,
    TPackedProviderInstrument,
    TPropertyCell,
    TPropertyRow,
    TProviderPropertyRow,
} from '../defs';
import { EDataKind, EPropertyGroup, ProviderInstrumentPropertyName } from '../defs';
import { getProviderInstruments } from '../utils/instruments.ts';
import type { TOverrideError } from './defs.ts';
import { cnGroup } from './styles.css.ts';

export const ROW_CLASS_RULES: RowClassRules<TProviderPropertyRow> = {
    [cnGroup]: ({ node }: RowClassParams<TProviderPropertyRow>) => isString(node.key),
};

export function getPackedProviderInstrumentColumnsNames(instruments: TInstrument[]): {
    id: number;
    name: string;
    group: ColDef<TPropertyRow>['field'];
    items: {
        field: ColDef<TProviderPropertyRow>['field'];
        name: string;
    }[];
}[] {
    return instruments
        .filter(({ providerInstruments }) => providerInstruments.length > 0)
        .map((fullInstrument) => ({
            id: fullInstrument.id,
            name: fullInstrument.name,
            group: `indicator-id-${fullInstrument.id}`,
            items: getProviderInstruments(fullInstrument).map(
                (
                    { name },
                    order,
                ): {
                    field: ColDef<TProviderPropertyRow>['field'];
                    name: string;
                } => ({
                    field: `indicator-id-${fullInstrument.id}|order-${order}`,
                    name,
                }),
            ),
        }));
}

export function getProviderInstrumentsRow(
    group: EPropertyGroup,
    property: string,
    items: TPackedProviderInstrument[],
    getter: (item: TPackedProviderInstrument) => TPropertyCell,
    override: TOverrideProviderInstrument,
    overrideValidation: TOverrideError[],
): TProviderPropertyRow {
    const overrideErrors = overrideValidation
        ?.filter((error) => error.group === group && error.property === property)
        ?.map(({ error }) => error);

    const overrideData = override[group]?.[property];

    return items.reduce(
        (acc, item) => {
            const cellErrors = item.errors?.filter(
                (cellError) => group === cellError.group && property === cellError.property,
            );

            acc[`indicator-id-${item.instrumentId}|order-${item.order}`] = {
                ...getter(item),
                errors: isEmpty(cellErrors) ? undefined : cellErrors?.map(({ message }) => message),
            };
            return acc;
        },
        {
            group,
            property,
            override: isNil(overrideData) ? undefined : { ...overrideData, errors: overrideErrors },
        } as TProviderPropertyRow,
    );
}

export function getProviderInstrumentDetailsFromOverride(
    override: TOverrideProviderInstrument | undefined,
): undefined | TProviderInstrumentDetails {
    if (isNil(override)) {
        return undefined;
    }

    const amountNotation = getAmountNotation(override);
    const priceNotation = getPriceNotation(override);
    const kind = getDetails(override);

    return isNil(amountNotation) && isNil(priceNotation) && isNil(kind)
        ? undefined
        : {
              amountNotation: getAmountNotation(override),
              priceNotation: getPriceNotation(override),
              kind: getDetails(override),
          };
}

function getAmountNotation(
    override: TOverrideProviderInstrument,
): undefined | TProviderInstrumentDetailsAmountNotation {
    const amountNotationOverride = override[EPropertyGroup.AmountNotation];

    if (isNil(amountNotationOverride)) {
        return undefined;
    }

    const assetName = amountNotationOverride[ProviderInstrumentPropertyName.AmountNotationAssetName]
        ?.data as string | undefined;
    const assetMultiplier = amountNotationOverride[
        ProviderInstrumentPropertyName.AmountNotationAssetMultiplier
    ]?.data as number | undefined;
    if (!isEmpty(assetName) || !isNil(assetMultiplier)) {
        return {
            value: {
                type: 'asset',
                asset: {
                    assetName,
                    multiplier: assetMultiplier,
                },
            },
        };
    }

    const instrumentName = amountNotationOverride[
        ProviderInstrumentPropertyName.AmountNotationInstrumentName
    ]?.data as string | undefined;
    const instrumentMultiplier = amountNotationOverride[
        ProviderInstrumentPropertyName.AmountNotationInstrumentMultiplier
    ]?.data as number | undefined;
    if (!isEmpty(instrumentName) || !isNil(instrumentMultiplier)) {
        return {
            value: {
                type: 'instrument',
                instrument: {
                    instrumentName,
                    multiplier: instrumentMultiplier,
                },
            },
        };
    }

    const indexName = amountNotationOverride[ProviderInstrumentPropertyName.AmountNotationIndexName]
        ?.data as string | undefined;
    const indexMultiplier = amountNotationOverride[
        ProviderInstrumentPropertyName.AmountNotationIndexMultiplier
    ]?.data as number | undefined;
    if (!isEmpty(indexName) || !isNil(indexMultiplier)) {
        return {
            value: {
                type: 'index',
                index: {
                    indexName,
                    multiplier: indexMultiplier,
                },
            },
        };
    }

    return undefined;
}

function getPriceNotation(
    override: TOverrideProviderInstrument,
): undefined | TProviderInstrumentDetailsPriceNotation {
    const priceNotationOverride = override[EPropertyGroup.PriceNotation];

    if (isNil(priceNotationOverride)) {
        return undefined;
    }

    const numeratorAssetName = priceNotationOverride[
        ProviderInstrumentPropertyName.PriceNotationNumeratorAssetName
    ]?.data as string | undefined;
    const numeratorInstrumentName = priceNotationOverride[
        ProviderInstrumentPropertyName.PriceNotationNumeratorInstrumentName
    ]?.data as string | undefined;
    const numeratorIndexName = priceNotationOverride[
        ProviderInstrumentPropertyName.PriceNotationNumeratorIndexName
    ]?.data as string | undefined;
    const numerator: undefined | TProviderInstrumentDetailsPriceNotationRatioPriceNotationUnit =
        !isEmpty(numeratorAssetName) && !isNil(numeratorAssetName)
            ? { value: { type: 'assetName', assetName: numeratorAssetName } }
            : !isEmpty(numeratorInstrumentName) && !isNil(numeratorInstrumentName)
              ? { value: { type: 'instrumentName', instrumentName: numeratorInstrumentName } }
              : !isEmpty(numeratorIndexName) && !isNil(numeratorIndexName)
                ? { value: { type: 'indexName', indexName: numeratorIndexName } }
                : undefined;

    const denominatorAssetName = priceNotationOverride[
        ProviderInstrumentPropertyName.PriceNotationDenominatorAssetName
    ]?.data as string | undefined;
    const denominatorInstrumentName = priceNotationOverride[
        ProviderInstrumentPropertyName.PriceNotationDenominatorInstrumentName
    ]?.data as string | undefined;
    const denominatorIndexName = priceNotationOverride[
        ProviderInstrumentPropertyName.PriceNotationDenominatorIndexName
    ]?.data as string | undefined;
    const denominator: undefined | TProviderInstrumentDetailsPriceNotationRatioPriceNotationUnit =
        !isEmpty(denominatorAssetName) && !isNil(denominatorAssetName)
            ? { value: { type: 'assetName', assetName: denominatorAssetName } }
            : !isEmpty(denominatorInstrumentName) && !isNil(denominatorInstrumentName)
              ? { value: { type: 'instrumentName', instrumentName: denominatorInstrumentName } }
              : !isEmpty(denominatorIndexName) && !isNil(denominatorIndexName)
                ? { value: { type: 'indexName', indexName: denominatorIndexName } }
                : undefined;

    const denominatorMultiplier = priceNotationOverride[
        ProviderInstrumentPropertyName.PriceNotationDenominatorMultiplier
    ]?.data as number | undefined;

    if (isEmpty(numerator) && isEmpty(denominator) && isEmpty(denominatorMultiplier)) {
        return undefined;
    }

    return {
        value: {
            type: 'ratio',
            ratio: {
                numerator,
                denominator,
                denominatorMultiplier,
            },
        },
    };
}

function getDetails(override: TOverrideProviderInstrument): TProviderInstrumentDetails['kind'] {
    const kind = override[EPropertyGroup.BaseProperties]?.[
        ProviderInstrumentPropertyName.BasePropertiesKind
    ]?.data as
        | Exclude<TInstrument['kind'] | TProviderInstrumentDetails['kind'], undefined>['type']
        | undefined;

    switch (kind) {
        case undefined:
            return undefined;
        case 'instantSpot':
            return getInstantSpot(override);
        case 'spotDetails':
            return getSpotDetails(override);
        case 'futuresDetails':
            return getFuturesDetails(override);
        case 'perpFutures':
            return getPerpFutures(override);
        case 'option':
            return getOption(override);
        case 'instrumentSwap':
            return getInstrumentSwap(override);
        default:
            assertNever(kind);
    }

    return undefined;
}

function getInstantSpot(override: TOverrideProviderInstrument):
    | undefined
    | {
          type: 'instantSpot';
          instantSpot: TProviderInstrumentDetailsInstantSpotDetails;
      } {
    const assetNames = getSpotAssetsNames(override);

    return isNil(assetNames)
        ? undefined
        : {
              type: 'instantSpot',
              instantSpot: assetNames,
          };
}

function getSpotDetails(override: TOverrideProviderInstrument):
    | undefined
    | {
          type: 'spotDetails';
          spotDetails: TProviderInstrumentDetailsSpotDetails;
      } {
    const assetNames = getSpotAssetsNames(override);
    const settlementTime = getSettlementTime(override);
    const settlementType = getSettlementType(override);

    return isNil(assetNames) && isNil(settlementTime) && isNil(settlementType)
        ? undefined
        : {
              type: 'spotDetails',
              spotDetails: {
                  ...assetNames,
                  settlementTime,
                  settlementType,
              },
          };
}

function getFuturesDetails(override: TOverrideProviderInstrument):
    | undefined
    | {
          type: 'futuresDetails';
          futuresDetails: TProviderInstrumentDetailsFuturesDetails;
      } {
    const settlementTime = getSettlementTime(override);
    const settlementType = getSettlementType(override);
    const startExpiration = getStartExpiration(override);
    const marginNotation = getMarginNotation(override);
    const payoutNotation = getPayoutNotation(override);
    const underlying = getUnderlying(override);
    const notional = getNotional(override);

    return isNil(settlementTime) &&
        isNil(settlementType) &&
        isNil(startExpiration) &&
        isNil(marginNotation) &&
        isNil(payoutNotation) &&
        isNil(underlying) &&
        isNil(notional)
        ? undefined
        : {
              type: 'futuresDetails',
              futuresDetails: {
                  notional,
                  underlying,
                  payoutNotation,
                  marginNotation,
                  ...startExpiration,
                  settlementTime,
                  settlementType,
              },
          };
}

function getPerpFutures(override: TOverrideProviderInstrument):
    | undefined
    | {
          type: 'perpFutures';
          perpFutures: TProviderInstrumentDetailsPerpFuturesDetails;
      } {
    const marginNotation = getMarginNotation(override);
    const payoutNotation = getPayoutNotation(override);
    const underlying = getUnderlying(override);
    const notional = getNotional(override);

    return isNil(marginNotation) && isNil(payoutNotation) && isNil(underlying) && isNil(notional)
        ? undefined
        : {
              type: 'perpFutures',
              perpFutures: {
                  notional,
                  underlying,
                  payoutNotation,
                  marginNotation,
              },
          };
}

function getOption(override: TOverrideProviderInstrument):
    | undefined
    | {
          type: 'option';
          option: TProviderInstrumentDetailsOptionDetails;
      } {
    const optionOverride = override[EPropertyGroup.Option];

    const settlementTime = getSettlementTime(override);
    const settlementType = getSettlementType(override);
    const startExpiration = getStartExpiration(override);
    const marginNotation = getMarginNotation(override);
    const underlying = getUnderlying(override);
    const notional = getNotional(override);
    const collateralizingType = optionOverride?.[
        ProviderInstrumentPropertyName.OptionCollateralizingType
    ]?.data as TProviderInstrumentDetailsOptionCollateralizingType | undefined;
    const optionType = optionOverride?.[ProviderInstrumentPropertyName.OptionType]?.data as
        | TProviderInstrumentDetailsOptionType
        | undefined;
    const optionStyle = optionOverride?.[ProviderInstrumentPropertyName.OptionStyle]?.data as
        | Exclude<TProviderInstrumentDetailsOptionStyle['value'], undefined>['type']
        | undefined;
    const strikePrice = optionOverride?.[ProviderInstrumentPropertyName.OptionStrikePrice]?.data as
        | number
        | undefined;

    return isNil(settlementType) &&
        isNil(startExpiration) &&
        isNil(marginNotation) &&
        isNil(underlying) &&
        isNil(notional) &&
        isNil(collateralizingType) &&
        isNil(optionType) &&
        isNil(optionStyle) &&
        isNil(strikePrice)
        ? undefined
        : {
              type: 'option',
              option: {
                  notional,
                  underlying,
                  marginNotation,
                  ...startExpiration,
                  settlementType,
                  collateralizingType,
                  optionType,
                  optionStyle:
                      optionStyle === 'american'
                          ? { value: { type: 'american', american: {} } }
                          : optionStyle === 'european'
                            ? { value: { type: 'european', european: { settlementTime } } }
                            : undefined,
                  strikePrice,
              },
          };
}

function getInstrumentSwap(override: TOverrideProviderInstrument):
    | undefined
    | {
          type: 'instrumentSwap';
          instrumentSwap: TProviderInstrumentDetailsInstrumentSwapDetails;
      } {
    const instrumentSwapOverride = override[EPropertyGroup.InstrumentSwap];

    if (isNil(instrumentSwapOverride)) {
        return undefined;
    }

    const buyInstrumentName = instrumentSwapOverride[
        ProviderInstrumentPropertyName.InstrumentSwapBuyInstrumentName
    ]?.data as string | undefined;
    const sellInstrumentName = instrumentSwapOverride[
        ProviderInstrumentPropertyName.InstrumentSwapSellInstrumentName
    ]?.data as string | undefined;

    return isNil(buyInstrumentName) && isNil(sellInstrumentName)
        ? undefined
        : {
              type: 'instrumentSwap',
              instrumentSwap: {
                  buyInstrumentName,
                  sellInstrumentName,
              },
          };
}
function getSpotAssetsNames(
    override: TOverrideProviderInstrument,
):
    | undefined
    | Pick<TProviderInstrumentDetailsInstantSpotDetails, 'baseAssetName' | 'quoteAssetName'> {
    const spotOverride = override[EPropertyGroup.Spot];

    if (isNil(spotOverride)) {
        return undefined;
    }

    const baseAssetName = spotOverride[ProviderInstrumentPropertyName.SpotBaseAssetName]?.data as
        | string
        | undefined;
    const quoteAssetName = spotOverride[ProviderInstrumentPropertyName.SpotQuoteAssetName]?.data as
        | string
        | undefined;

    return isEmpty(baseAssetName) && isEmpty(quoteAssetName)
        ? undefined
        : { baseAssetName, quoteAssetName };
}

function getSettlementTime(override: TOverrideProviderInstrument): undefined | ISO {
    return override[EPropertyGroup.Settlement]?.[ProviderInstrumentPropertyName.SettlementTime]
        ?.data as ISO | undefined;
}

function getSettlementType(
    override: TOverrideProviderInstrument,
): undefined | TProviderInstrumentDetailsSettlementType {
    const settlementOverride = override[EPropertyGroup.Settlement];

    if (isNil(settlementOverride)) {
        return undefined;
    }

    const type = settlementOverride[ProviderInstrumentPropertyName.SettlementType]?.data as
        | Exclude<TProviderInstrumentDetailsSettlementType['value'], undefined>['type']
        | undefined;

    switch (type) {
        case undefined:
            return undefined;
        case 'financiallySettled': {
            const assetName = settlementOverride[ProviderInstrumentPropertyName.SettlementAssetName]
                ?.data as string | undefined;

            return isNil(assetName)
                ? undefined
                : {
                      value: {
                          type: 'financiallySettled',
                          financiallySettled: {
                              assetName,
                          },
                      },
                  };
        }
        case 'physicallyDelivered': {
            const assetName = settlementOverride[ProviderInstrumentPropertyName.SettlementAssetName]
                ?.data as string | undefined;
            const assetsPerContract = settlementOverride[
                ProviderInstrumentPropertyName.SettlementAssetsPerContract
            ]?.data as number | undefined;

            return isNil(assetName) && isNil(assetsPerContract)
                ? undefined
                : {
                      value: {
                          type: 'physicallyDelivered',
                          physicallyDelivered: {
                              assetName,
                              assetsPerContract,
                          },
                      },
                  };
        }
        case 'exercisesIntoInstrument': {
            const instrumentName = settlementOverride[
                ProviderInstrumentPropertyName.SettlementInstrumentName
            ]?.data as string | undefined;
            const instrumentsPerContract = settlementOverride[
                ProviderInstrumentPropertyName.SettlementInstrumentsPerContract
            ]?.data as number | undefined;

            return isNil(instrumentName) && isNil(instrumentsPerContract)
                ? undefined
                : {
                      value: {
                          type: 'exercisesIntoInstrument',
                          exercisesIntoInstrument: {
                              instrumentName,
                              instrumentsPerContract,
                          },
                      },
                  };
        }
        default:
            assertNever(type);
    }
}

function getStartExpiration(
    override: TOverrideProviderInstrument,
): undefined | Pick<TProviderInstrumentDetailsFuturesDetails, 'startTime' | 'expirationTime'> {
    const startExpirationOverride = override[EPropertyGroup.StartExpiration];

    if (isNil(startExpirationOverride)) {
        return undefined;
    }

    const startTime = startExpirationOverride[
        ProviderInstrumentPropertyName.StartExpirationStartTime
    ]?.data as ISO | undefined;
    const expirationTime = startExpirationOverride[
        ProviderInstrumentPropertyName.StartExpirationExpirationTime
    ]?.data as ISO | undefined;

    return isEmpty(startTime) && isEmpty(expirationTime)
        ? undefined
        : { startTime, expirationTime };
}

function getMarginNotation(
    override: TOverrideProviderInstrument,
): undefined | TProviderInstrumentDetailsMarginNotation {
    const assetName = override[EPropertyGroup.MarginNotation]?.[
        ProviderInstrumentPropertyName.MarginNotationAssetName
    ]?.data as string | undefined;

    return isNil(assetName) ? undefined : { value: { type: 'assetName', assetName } };
}

function getPayoutNotation(
    override: TOverrideProviderInstrument,
): undefined | TProviderInstrumentDetailsFuturesPayoutNotation {
    const payoutNotationOverride = override[EPropertyGroup.PayoutNotation];

    if (isNil(payoutNotationOverride)) {
        return undefined;
    }

    const payoutUnitAssetName = payoutNotationOverride[
        ProviderInstrumentPropertyName.PayoutNotationUnitAssetName
    ]?.data as string | undefined;
    const payoutFunction = payoutNotationOverride[
        ProviderInstrumentPropertyName.PayoutNotationFunction
    ]?.data as TProviderInstrumentDetailsFuturesPayoutNotationFuturesPayoutFunction | undefined;

    return isNil(payoutFunction)
        ? undefined
        : {
              payoutFunction,
              payoutUnit: isNil(payoutUnitAssetName)
                  ? undefined
                  : { value: { type: 'assetName', assetName: payoutUnitAssetName } },
          };
}

function getUnderlying(
    override: TOverrideProviderInstrument,
): undefined | TProviderInstrumentDetailsUnderlying {
    const underlyingOverride = override[EPropertyGroup.Underlying];

    if (isNil(underlyingOverride)) {
        return undefined;
    }

    const assetName = underlyingOverride[ProviderInstrumentPropertyName.UnderlyingAssetName]
        ?.data as string | undefined;
    const instrumentName = underlyingOverride[
        ProviderInstrumentPropertyName.UnderlyingInstrumentName
    ]?.data as string | undefined;
    const indexName = underlyingOverride[ProviderInstrumentPropertyName.UnderlyingIndexName]
        ?.data as string | undefined;

    return !isEmpty(assetName) && !isNil(assetName)
        ? { value: { type: 'assetName', assetName } }
        : !isEmpty(instrumentName) && !isNil(instrumentName)
          ? { value: { type: 'instrumentName', instrumentName } }
          : !isEmpty(indexName) && !isNil(indexName)
            ? { value: { type: 'indexName', indexName } }
            : undefined;
}

function getNotional(
    override: TOverrideProviderInstrument,
): undefined | TProviderInstrumentDetailsNotional {
    const notionalOverride = override[EPropertyGroup.Notional];

    if (isNil(notionalOverride)) {
        return undefined;
    }

    const type = notionalOverride[ProviderInstrumentPropertyName.NotionalKind]?.data as
        | Exclude<TProviderInstrumentDetailsNotional['value'], undefined>['type']
        | undefined;

    switch (type) {
        case undefined:
            return undefined;
        case 'asset': {
            const assetName = notionalOverride[ProviderInstrumentPropertyName.NotionalAssetName]
                ?.data as string | undefined;
            const assetsPerContract = notionalOverride[
                ProviderInstrumentPropertyName.NotionalAssetsPerContract
            ]?.data as number | undefined;

            return isNil(assetName) || isNil(assetsPerContract)
                ? undefined
                : {
                      value: {
                          type: 'asset',
                          asset: {
                              assetName,
                              assetsPerContract,
                          },
                      },
                  };
        }
        case 'instrument': {
            const instrumentName = notionalOverride[
                ProviderInstrumentPropertyName.NotionalInstrumentName
            ]?.data as string | undefined;
            const instrumentsPerContract = notionalOverride[
                ProviderInstrumentPropertyName.NotionalInstrumentsPerContract
            ]?.data as number | undefined;

            return isNil(instrumentName) || isNil(instrumentsPerContract)
                ? undefined
                : {
                      value: {
                          type: 'instrument',
                          instrument: {
                              instrumentName,
                              instrumentsPerContract,
                          },
                      },
                  };
        }
        case 'priceProportional': {
            const factor = notionalOverride[ProviderInstrumentPropertyName.NotionalFactor]?.data as
                | number
                | undefined;
            const notationAssetName = notionalOverride[
                ProviderInstrumentPropertyName.NotionalNotationAssetName
            ]?.data as string | undefined;
            const instrumentName = notionalOverride[
                ProviderInstrumentPropertyName.NotionalPriceSourceInstrumentName
            ]?.data as string | undefined;
            const indexName = notionalOverride[
                ProviderInstrumentPropertyName.NotionalPriceSourceIndexName
            ]?.data as string | undefined;

            return isNil(factor) || isNil(notationAssetName)
                ? undefined
                : {
                      value: {
                          type: 'priceProportional',
                          priceProportional: {
                              factor,
                              notationAssetName,
                              priceSource: !isNil(instrumentName)
                                  ? {
                                        value: {
                                            type: 'instrumentName',
                                            instrumentName,
                                        },
                                    }
                                  : !isNil(indexName)
                                    ? {
                                          value: {
                                              type: 'indexName',
                                              indexName,
                                          },
                                      }
                                    : undefined,
                          },
                      },
                  };
        }
        default:
            assertNever(type);
    }
}

export function getEditablePropertyCellValueFormatter(
    timeZone: TimeZone,
): ValueFormatterFunc<TProviderPropertyRow, undefined | TEditablePropertyCell> {
    return ({
        value,
    }: ValueFormatterParams<TProviderPropertyRow, undefined | TEditablePropertyCell>): string => {
        if (isNil(value) || !('kind' in value) || isNil(value.kind) || isNil(value.data)) {
            return '';
        }

        const { kind, data } = value;

        switch (kind) {
            case EDataKind.Number:
                return data.toString();
            case EDataKind.String:
                return data;
            case EDataKind.Select:
                return isNil(value.params.valueFormatter)
                    ? data.toString()
                    : value.params.valueFormatter(data);
            case EDataKind.DateTime:
                return toDayjsWithTimezone(data, timeZone).format(EDateTimeFormats.DateTime);
            default:
                assertNever(kind);
        }
    };
}
