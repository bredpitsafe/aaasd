import type { TInstrument } from '@backend/bff/src/modules/instruments/schemas/defs.ts';
import type { ISO } from '@common/types';
import {
    instrumentCollateralizingTypeToDisplayType,
    instrumentNotionalTypeToDisplayType,
    instrumentOptionStyleToDisplayStyle,
    instrumentOptionTypeToDisplayType,
    instrumentPayoutFunctionToDisplayPayoutFunction,
    kindToDisplayKind,
    providerInstrumentSourceToDisplaySource,
    settlementTypeToDisplaySettlementType,
} from '@frontend/common/src/utils/instruments/converters.ts';
import { isNil } from 'lodash-es';
import { useMemo } from 'react';

import type {
    TInstrumentWithRevisions,
    TPackedProviderInstrument,
    TRevisionProviderPropertyRow,
} from '../../defs.ts';
import { EDataKind, EPropertyGroup, ProviderInstrumentPropertyName } from '../../defs.ts';
import { getProviderInstrumentsRow } from '../utils.ts';

export function useTransposeProviderInstruments(
    displayProviderInstruments:
        | { instrument: TInstrument; providerInstruments: TPackedProviderInstrument[] }[]
        | undefined,
    revisionInstrumentsIds: TInstrumentWithRevisions[],
): TRevisionProviderPropertyRow[] | undefined {
    return useMemo(
        () =>
            isNil(displayProviderInstruments)
                ? undefined
                : [
                      ...getProviderBasePropertiesRows(
                          displayProviderInstruments,
                          revisionInstrumentsIds,
                      ),
                      ...getProviderAmountNotationRows(
                          displayProviderInstruments,
                          revisionInstrumentsIds,
                      ),
                      ...getProviderPriceNotationRows(
                          displayProviderInstruments,
                          revisionInstrumentsIds,
                      ),
                      ...getProviderSettlementRows(
                          displayProviderInstruments,
                          revisionInstrumentsIds,
                      ),
                      ...getProviderNotionalRows(
                          displayProviderInstruments,
                          revisionInstrumentsIds,
                      ),
                      ...getProviderUnderlyingRows(
                          displayProviderInstruments,
                          revisionInstrumentsIds,
                      ),
                      ...getProviderSpotRows(displayProviderInstruments, revisionInstrumentsIds),
                      ...getProviderStartExpirationRows(
                          displayProviderInstruments,
                          revisionInstrumentsIds,
                      ),
                      ...getProviderPayoutNotationRows(
                          displayProviderInstruments,
                          revisionInstrumentsIds,
                      ),
                      ...getProviderMarginNotationRows(
                          displayProviderInstruments,
                          revisionInstrumentsIds,
                      ),
                      ...getProviderOptionRows(displayProviderInstruments, revisionInstrumentsIds),
                      ...getProviderInstrumentSwapRows(
                          displayProviderInstruments,
                          revisionInstrumentsIds,
                      ),
                  ],
        [displayProviderInstruments, revisionInstrumentsIds],
    );
}

function getProviderBasePropertiesRows(
    displayProviderInstruments: {
        instrument: TInstrument;
        providerInstruments: TPackedProviderInstrument[];
    }[],
    revisionInstrumentsIds: TInstrumentWithRevisions[],
) {
    return [
        getProviderInstrumentsRow(
            EPropertyGroup.BaseProperties,
            ProviderInstrumentPropertyName.BasePropertiesName,
            displayProviderInstruments,
            ({ name }) => ({ data: name, kind: EDataKind.String }),
            revisionInstrumentsIds,
        ),
        getProviderInstrumentsRow(
            EPropertyGroup.BaseProperties,
            ProviderInstrumentPropertyName.BasePropertiesKind,
            displayProviderInstruments,
            ({ kind }) => ({
                data: isNil(kind) ? undefined : kindToDisplayKind(kind),
                kind: EDataKind.String,
            }),
            revisionInstrumentsIds,
        ),
        getProviderInstrumentsRow(
            EPropertyGroup.BaseProperties,
            ProviderInstrumentPropertyName.BasePropertiesSource,
            displayProviderInstruments,
            ({ source }) => ({
                data: providerInstrumentSourceToDisplaySource(source),
                kind: EDataKind.String,
            }),
            revisionInstrumentsIds,
        ),
        getProviderInstrumentsRow(
            EPropertyGroup.BaseProperties,
            ProviderInstrumentPropertyName.BasePropertiesDate,
            displayProviderInstruments,
            ({ platformTime }) => ({
                data: platformTime as ISO,
                kind: EDataKind.DateTime,
            }),
            revisionInstrumentsIds,
        ),
        getProviderInstrumentsRow(
            EPropertyGroup.BaseProperties,
            ProviderInstrumentPropertyName.BasePropertiesProvider,
            displayProviderInstruments,
            ({ provider }) => ({
                data: provider,
                kind: EDataKind.String,
            }),
            revisionInstrumentsIds,
        ),
    ];
}

function getProviderAmountNotationRows(
    displayProviderInstruments: {
        instrument: TInstrument;
        providerInstruments: TPackedProviderInstrument[];
    }[],
    revisionInstrumentsIds: TInstrumentWithRevisions[],
) {
    return [
        getProviderInstrumentsRow(
            EPropertyGroup.AmountNotation,
            ProviderInstrumentPropertyName.AmountNotationAssetName,
            displayProviderInstruments,
            ({ amountNotation }) => ({
                data:
                    amountNotation?.value?.type === 'asset'
                        ? amountNotation.value.asset.assetName
                        : undefined,
                kind: EDataKind.String,
            }),
            revisionInstrumentsIds,
        ),
        getProviderInstrumentsRow(
            EPropertyGroup.AmountNotation,
            ProviderInstrumentPropertyName.AmountNotationAssetMultiplier,
            displayProviderInstruments,
            ({ amountNotation }) => ({
                data:
                    amountNotation?.value?.type === 'asset'
                        ? amountNotation.value.asset.multiplier
                        : undefined,
                kind: EDataKind.Number,
            }),
            revisionInstrumentsIds,
        ),
        getProviderInstrumentsRow(
            EPropertyGroup.AmountNotation,
            ProviderInstrumentPropertyName.AmountNotationInstrumentName,
            displayProviderInstruments,
            ({ amountNotation }) => ({
                data:
                    amountNotation?.value?.type === 'instrument'
                        ? amountNotation.value.instrument.instrumentName
                        : undefined,
                kind: EDataKind.String,
            }),
            revisionInstrumentsIds,
        ),
        getProviderInstrumentsRow(
            EPropertyGroup.AmountNotation,
            ProviderInstrumentPropertyName.AmountNotationInstrumentMultiplier,
            displayProviderInstruments,
            ({ amountNotation }) => ({
                data:
                    amountNotation?.value?.type === 'instrument'
                        ? amountNotation.value.instrument.multiplier
                        : undefined,
                kind: EDataKind.Number,
            }),
            revisionInstrumentsIds,
        ),
        getProviderInstrumentsRow(
            EPropertyGroup.AmountNotation,
            ProviderInstrumentPropertyName.AmountNotationIndexName,
            displayProviderInstruments,
            ({ amountNotation }) => ({
                data:
                    amountNotation?.value?.type === 'index'
                        ? amountNotation.value.index.indexName
                        : undefined,
                kind: EDataKind.String,
            }),
            revisionInstrumentsIds,
        ),
        getProviderInstrumentsRow(
            EPropertyGroup.AmountNotation,
            ProviderInstrumentPropertyName.AmountNotationIndexMultiplier,
            displayProviderInstruments,
            ({ amountNotation }) => ({
                data:
                    amountNotation?.value?.type === 'index'
                        ? amountNotation.value.index.multiplier
                        : undefined,
                kind: EDataKind.Number,
            }),
            revisionInstrumentsIds,
        ),
    ];
}

function getProviderPriceNotationRows(
    displayProviderInstruments: {
        instrument: TInstrument;
        providerInstruments: TPackedProviderInstrument[];
    }[],
    revisionInstrumentsIds: TInstrumentWithRevisions[],
) {
    return [
        getProviderInstrumentsRow(
            EPropertyGroup.PriceNotation,
            ProviderInstrumentPropertyName.PriceNotationNumeratorAssetName,
            displayProviderInstruments,
            ({ priceNotation }) => ({
                data:
                    priceNotation?.value?.ratio.numerator?.value?.type === 'assetName'
                        ? priceNotation.value.ratio.numerator.value.assetName
                        : undefined,
                kind: EDataKind.String,
            }),
            revisionInstrumentsIds,
        ),
        getProviderInstrumentsRow(
            EPropertyGroup.PriceNotation,
            ProviderInstrumentPropertyName.PriceNotationNumeratorInstrumentName,
            displayProviderInstruments,
            ({ priceNotation }) => ({
                data:
                    priceNotation?.value?.ratio.numerator?.value?.type === 'instrumentName'
                        ? priceNotation.value.ratio.numerator.value.instrumentName
                        : undefined,
                kind: EDataKind.String,
            }),
            revisionInstrumentsIds,
        ),
        getProviderInstrumentsRow(
            EPropertyGroup.PriceNotation,
            ProviderInstrumentPropertyName.PriceNotationNumeratorIndexName,
            displayProviderInstruments,
            ({ priceNotation }) => ({
                data:
                    priceNotation?.value?.ratio.numerator?.value?.type === 'indexName'
                        ? priceNotation.value.ratio.numerator.value.indexName
                        : undefined,
                kind: EDataKind.String,
            }),
            revisionInstrumentsIds,
        ),
        getProviderInstrumentsRow(
            EPropertyGroup.PriceNotation,
            ProviderInstrumentPropertyName.PriceNotationDenominatorAssetName,
            displayProviderInstruments,
            ({ priceNotation }) => ({
                data:
                    priceNotation?.value?.ratio.denominator?.value?.type === 'assetName'
                        ? priceNotation.value.ratio.denominator.value.assetName
                        : undefined,
                kind: EDataKind.String,
            }),
            revisionInstrumentsIds,
        ),
        getProviderInstrumentsRow(
            EPropertyGroup.PriceNotation,
            ProviderInstrumentPropertyName.PriceNotationDenominatorInstrumentName,
            displayProviderInstruments,
            ({ priceNotation }) => ({
                data:
                    priceNotation?.value?.ratio.denominator?.value?.type === 'instrumentName'
                        ? priceNotation.value.ratio.denominator.value.instrumentName
                        : undefined,
                kind: EDataKind.String,
            }),
            revisionInstrumentsIds,
        ),
        getProviderInstrumentsRow(
            EPropertyGroup.PriceNotation,
            ProviderInstrumentPropertyName.PriceNotationDenominatorIndexName,
            displayProviderInstruments,
            ({ priceNotation }) => ({
                data:
                    priceNotation?.value?.ratio.denominator?.value?.type === 'indexName'
                        ? priceNotation.value.ratio.denominator.value.indexName
                        : undefined,
                kind: EDataKind.String,
            }),
            revisionInstrumentsIds,
        ),
        getProviderInstrumentsRow(
            EPropertyGroup.PriceNotation,
            ProviderInstrumentPropertyName.PriceNotationDenominatorMultiplier,
            displayProviderInstruments,
            ({ priceNotation }) => ({
                data: priceNotation?.value?.ratio.denominatorMultiplier,
                kind: EDataKind.Number,
            }),
            revisionInstrumentsIds,
        ),
    ];
}

function getProviderSettlementRows(
    displayProviderInstruments: {
        instrument: TInstrument;
        providerInstruments: TPackedProviderInstrument[];
    }[],
    revisionInstrumentsIds: TInstrumentWithRevisions[],
) {
    return [
        getProviderInstrumentsRow(
            EPropertyGroup.Settlement,
            ProviderInstrumentPropertyName.SettlementType,
            displayProviderInstruments,
            ({ settlement }) => ({
                data: isNil(settlement?.type)
                    ? undefined
                    : settlementTypeToDisplaySettlementType(settlement.type.type),
                kind: EDataKind.String,
            }),
            revisionInstrumentsIds,
        ),
        getProviderInstrumentsRow(
            EPropertyGroup.Settlement,
            ProviderInstrumentPropertyName.SettlementTime,
            displayProviderInstruments,
            ({ settlement }) => ({
                data: settlement?.time,
                kind: EDataKind.DateTime,
            }),
            revisionInstrumentsIds,
        ),
        getProviderInstrumentsRow(
            EPropertyGroup.Settlement,
            ProviderInstrumentPropertyName.SettlementAssetName,
            displayProviderInstruments,
            ({ settlement }) => ({
                data:
                    settlement?.type?.type === 'financiallySettled'
                        ? settlement.type.financiallySettled.assetName
                        : settlement?.type?.type === 'physicallyDelivered'
                          ? settlement.type.physicallyDelivered.assetName
                          : undefined,
                kind: EDataKind.String,
            }),
            revisionInstrumentsIds,
        ),
        getProviderInstrumentsRow(
            EPropertyGroup.Settlement,
            ProviderInstrumentPropertyName.SettlementAssetsPerContract,
            displayProviderInstruments,
            ({ settlement }) => ({
                data:
                    settlement?.type?.type === 'physicallyDelivered'
                        ? settlement.type.physicallyDelivered.assetsPerContract
                        : undefined,
                kind: EDataKind.Number,
            }),
            revisionInstrumentsIds,
        ),
        getProviderInstrumentsRow(
            EPropertyGroup.Settlement,
            ProviderInstrumentPropertyName.SettlementInstrumentName,
            displayProviderInstruments,
            ({ settlement }) => ({
                data:
                    settlement?.type?.type === 'exercisesIntoInstrument'
                        ? settlement.type.exercisesIntoInstrument.instrumentName
                        : undefined,
                kind: EDataKind.String,
            }),
            revisionInstrumentsIds,
        ),
        getProviderInstrumentsRow(
            EPropertyGroup.Settlement,
            ProviderInstrumentPropertyName.SettlementInstrumentsPerContract,
            displayProviderInstruments,
            ({ settlement }) => ({
                data:
                    settlement?.type?.type === 'exercisesIntoInstrument'
                        ? settlement.type.exercisesIntoInstrument.instrumentsPerContract
                        : undefined,
                kind: EDataKind.Number,
            }),
            revisionInstrumentsIds,
        ),
    ];
}

function getProviderNotionalRows(
    displayProviderInstruments: {
        instrument: TInstrument;
        providerInstruments: TPackedProviderInstrument[];
    }[],
    revisionInstrumentsIds: TInstrumentWithRevisions[],
) {
    return [
        getProviderInstrumentsRow(
            EPropertyGroup.Notional,
            ProviderInstrumentPropertyName.NotionalKind,
            displayProviderInstruments,
            ({ notional }) => ({
                data: isNil(notional?.type)
                    ? undefined
                    : instrumentNotionalTypeToDisplayType(notional.type),
                kind: EDataKind.String,
            }),
            revisionInstrumentsIds,
        ),
        getProviderInstrumentsRow(
            EPropertyGroup.Notional,
            ProviderInstrumentPropertyName.NotionalAssetName,
            displayProviderInstruments,
            ({ notional }) => ({
                data: notional?.type === 'asset' ? notional.asset.assetName : undefined,
                kind: EDataKind.String,
            }),
            revisionInstrumentsIds,
        ),
        getProviderInstrumentsRow(
            EPropertyGroup.Notional,
            ProviderInstrumentPropertyName.NotionalAssetsPerContract,
            displayProviderInstruments,
            ({ notional }) => ({
                data: notional?.type === 'asset' ? notional.asset.assetsPerContract : undefined,
                kind: EDataKind.Number,
            }),
            revisionInstrumentsIds,
        ),
        getProviderInstrumentsRow(
            EPropertyGroup.Notional,
            ProviderInstrumentPropertyName.NotionalInstrumentName,
            displayProviderInstruments,
            ({ notional }) => ({
                data:
                    notional?.type === 'instrument'
                        ? notional.instrument.instrumentName
                        : undefined,
                kind: EDataKind.String,
            }),
            revisionInstrumentsIds,
        ),
        getProviderInstrumentsRow(
            EPropertyGroup.Notional,
            ProviderInstrumentPropertyName.NotionalInstrumentsPerContract,
            displayProviderInstruments,
            ({ notional }) => ({
                data:
                    notional?.type === 'instrument'
                        ? notional.instrument.instrumentsPerContract
                        : undefined,
                kind: EDataKind.Number,
            }),
            revisionInstrumentsIds,
        ),
        getProviderInstrumentsRow(
            EPropertyGroup.Notional,
            ProviderInstrumentPropertyName.NotionalFactor,
            displayProviderInstruments,
            ({ notional }) => ({
                data:
                    notional?.type === 'priceProportional'
                        ? notional.priceProportional.factor
                        : undefined,
                kind: EDataKind.Number,
            }),
            revisionInstrumentsIds,
        ),
        getProviderInstrumentsRow(
            EPropertyGroup.Notional,
            ProviderInstrumentPropertyName.NotionalNotationAssetName,
            displayProviderInstruments,
            ({ notional }) => ({
                data:
                    notional?.type === 'priceProportional'
                        ? notional.priceProportional.notationAssetName
                        : undefined,
                kind: EDataKind.String,
            }),
            revisionInstrumentsIds,
        ),
        getProviderInstrumentsRow(
            EPropertyGroup.Notional,
            ProviderInstrumentPropertyName.NotionalPriceSourceInstrumentName,
            displayProviderInstruments,
            ({ notional }) => ({
                data:
                    notional?.type === 'priceProportional' &&
                    notional.priceProportional.priceSource?.value?.type === 'instrumentName'
                        ? notional.priceProportional.priceSource.value.instrumentName
                        : undefined,
                kind: EDataKind.String,
            }),
            revisionInstrumentsIds,
        ),
        getProviderInstrumentsRow(
            EPropertyGroup.Notional,
            ProviderInstrumentPropertyName.NotionalPriceSourceIndexName,
            displayProviderInstruments,
            ({ notional }) => ({
                data:
                    notional?.type === 'priceProportional' &&
                    notional.priceProportional.priceSource?.value?.type === 'indexName'
                        ? notional.priceProportional.priceSource.value.indexName
                        : undefined,
                kind: EDataKind.String,
            }),
            revisionInstrumentsIds,
        ),
    ];
}

function getProviderUnderlyingRows(
    displayProviderInstruments: {
        instrument: TInstrument;
        providerInstruments: TPackedProviderInstrument[];
    }[],
    revisionInstrumentsIds: TInstrumentWithRevisions[],
) {
    return [
        getProviderInstrumentsRow(
            EPropertyGroup.Underlying,
            ProviderInstrumentPropertyName.UnderlyingAssetName,
            displayProviderInstruments,
            ({ underlying }) => ({
                data: underlying?.type === 'assetName' ? underlying.assetName : undefined,
                kind: EDataKind.String,
            }),
            revisionInstrumentsIds,
        ),
        getProviderInstrumentsRow(
            EPropertyGroup.Underlying,
            ProviderInstrumentPropertyName.UnderlyingInstrumentName,
            displayProviderInstruments,
            ({ underlying }) => ({
                data: underlying?.type === 'instrumentName' ? underlying.instrumentName : undefined,
                kind: EDataKind.String,
            }),
            revisionInstrumentsIds,
        ),
        getProviderInstrumentsRow(
            EPropertyGroup.Underlying,
            ProviderInstrumentPropertyName.UnderlyingIndexName,
            displayProviderInstruments,
            ({ underlying }) => ({
                data: underlying?.type === 'indexName' ? underlying.indexName : undefined,
                kind: EDataKind.String,
            }),
            revisionInstrumentsIds,
        ),
    ];
}

function getProviderSpotRows(
    displayProviderInstruments: {
        instrument: TInstrument;
        providerInstruments: TPackedProviderInstrument[];
    }[],
    revisionInstrumentsIds: TInstrumentWithRevisions[],
) {
    return [
        getProviderInstrumentsRow(
            EPropertyGroup.Spot,
            ProviderInstrumentPropertyName.SpotBaseAssetName,
            displayProviderInstruments,
            ({ baseAssetName }) => ({
                data: baseAssetName,
                kind: EDataKind.String,
            }),
            revisionInstrumentsIds,
        ),
        getProviderInstrumentsRow(
            EPropertyGroup.Spot,
            ProviderInstrumentPropertyName.SpotQuoteAssetName,
            displayProviderInstruments,
            ({ quoteAssetName }) => ({
                data: quoteAssetName,
                kind: EDataKind.String,
            }),
            revisionInstrumentsIds,
        ),
    ];
}

function getProviderStartExpirationRows(
    displayProviderInstruments: {
        instrument: TInstrument;
        providerInstruments: TPackedProviderInstrument[];
    }[],
    revisionInstrumentsIds: TInstrumentWithRevisions[],
) {
    return [
        getProviderInstrumentsRow(
            EPropertyGroup.StartExpiration,
            ProviderInstrumentPropertyName.StartExpirationStartTime,
            displayProviderInstruments,
            ({ startTime }) => ({
                data: startTime as ISO,
                kind: EDataKind.DateTime,
            }),
            revisionInstrumentsIds,
        ),
        getProviderInstrumentsRow(
            EPropertyGroup.StartExpiration,
            ProviderInstrumentPropertyName.StartExpirationExpirationTime,
            displayProviderInstruments,
            ({ expirationTime }) => ({
                data: expirationTime as ISO,
                kind: EDataKind.DateTime,
            }),
            revisionInstrumentsIds,
        ),
    ];
}

function getProviderPayoutNotationRows(
    displayProviderInstruments: {
        instrument: TInstrument;
        providerInstruments: TPackedProviderInstrument[];
    }[],
    revisionInstrumentsIds: TInstrumentWithRevisions[],
) {
    return [
        getProviderInstrumentsRow(
            EPropertyGroup.PayoutNotation,
            ProviderInstrumentPropertyName.PayoutNotationUnitAssetName,
            displayProviderInstruments,
            ({ payoutNotation }) => ({
                data:
                    payoutNotation?.payoutUnit?.value?.type === 'assetName'
                        ? payoutNotation.payoutUnit.value.assetName
                        : undefined,
                kind: EDataKind.String,
            }),
            revisionInstrumentsIds,
        ),
        getProviderInstrumentsRow(
            EPropertyGroup.PayoutNotation,
            ProviderInstrumentPropertyName.PayoutNotationFunction,
            displayProviderInstruments,
            ({ payoutNotation }) => ({
                data: isNil(payoutNotation)
                    ? undefined
                    : instrumentPayoutFunctionToDisplayPayoutFunction(
                          payoutNotation.payoutFunction,
                      ),
                kind: EDataKind.String,
            }),
            revisionInstrumentsIds,
        ),
    ];
}

function getProviderMarginNotationRows(
    displayProviderInstruments: {
        instrument: TInstrument;
        providerInstruments: TPackedProviderInstrument[];
    }[],
    revisionInstrumentsIds: TInstrumentWithRevisions[],
) {
    return [
        getProviderInstrumentsRow(
            EPropertyGroup.MarginNotation,
            ProviderInstrumentPropertyName.MarginNotationAssetName,
            displayProviderInstruments,
            ({ marginNotation }) => ({
                data:
                    isNil(marginNotation) || marginNotation.type !== 'assetName'
                        ? undefined
                        : marginNotation.assetName,
                kind: EDataKind.String,
            }),
            revisionInstrumentsIds,
        ),
    ];
}

function getProviderOptionRows(
    displayProviderInstruments: {
        instrument: TInstrument;
        providerInstruments: TPackedProviderInstrument[];
    }[],
    revisionInstrumentsIds: TInstrumentWithRevisions[],
) {
    return [
        getProviderInstrumentsRow(
            EPropertyGroup.Option,
            ProviderInstrumentPropertyName.OptionCollateralizingType,
            displayProviderInstruments,
            ({ option }) => ({
                data:
                    isNil(option) || isNil(option.collateralizingType)
                        ? undefined
                        : instrumentCollateralizingTypeToDisplayType(option.collateralizingType),
                kind: EDataKind.String,
            }),
            revisionInstrumentsIds,
        ),
        getProviderInstrumentsRow(
            EPropertyGroup.Option,
            ProviderInstrumentPropertyName.OptionType,
            displayProviderInstruments,
            ({ option }) => ({
                data:
                    isNil(option) || isNil(option.optionType)
                        ? undefined
                        : instrumentOptionTypeToDisplayType(option.optionType),
                kind: EDataKind.String,
            }),
            revisionInstrumentsIds,
        ),
        getProviderInstrumentsRow(
            EPropertyGroup.Option,
            ProviderInstrumentPropertyName.OptionStyle,
            displayProviderInstruments,
            ({ option }) => ({
                data:
                    isNil(option) || isNil(option.optionStyle?.value?.type)
                        ? undefined
                        : instrumentOptionStyleToDisplayStyle(option.optionStyle.value.type),
                kind: EDataKind.String,
            }),
            revisionInstrumentsIds,
        ),
        getProviderInstrumentsRow(
            EPropertyGroup.Option,
            ProviderInstrumentPropertyName.OptionStrikePrice,
            displayProviderInstruments,
            ({ option }) => ({
                data: option?.strikePrice,
                kind: EDataKind.Number,
            }),
            revisionInstrumentsIds,
        ),
    ];
}

function getProviderInstrumentSwapRows(
    displayProviderInstruments: {
        instrument: TInstrument;
        providerInstruments: TPackedProviderInstrument[];
    }[],
    revisionInstrumentsIds: TInstrumentWithRevisions[],
) {
    return [
        getProviderInstrumentsRow(
            EPropertyGroup.InstrumentSwap,
            ProviderInstrumentPropertyName.InstrumentSwapBuyInstrumentName,
            displayProviderInstruments,
            ({ instrumentSwap }) => ({
                data: instrumentSwap?.buyInstrumentName,
                kind: EDataKind.String,
            }),
            revisionInstrumentsIds,
        ),
        getProviderInstrumentsRow(
            EPropertyGroup.InstrumentSwap,
            ProviderInstrumentPropertyName.InstrumentSwapSellInstrumentName,
            displayProviderInstruments,
            ({ instrumentSwap }) => ({
                data: instrumentSwap?.sellInstrumentName,
                kind: EDataKind.String,
            }),
            revisionInstrumentsIds,
        ),
    ];
}
