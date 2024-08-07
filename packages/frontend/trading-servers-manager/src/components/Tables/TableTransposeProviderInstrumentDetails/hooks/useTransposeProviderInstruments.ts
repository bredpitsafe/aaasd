import type { TInstrument } from '@backend/bff/src/modules/instruments/schemas/defs.ts';
import type { ISO } from '@common/types';
import { EMPTY_ARRAY } from '@frontend/common/src/utils/const.ts';
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
import type { TValueDescriptor2 } from '@frontend/common/src/utils/ValueDescriptor/types.ts';
import {
    isFailValueDescriptor,
    matchValueDescriptor,
} from '@frontend/common/src/utils/ValueDescriptor/utils.ts';
import { isNil } from 'lodash-es';
import { useMemo } from 'react';

import type {
    TOverrideProviderInstrument,
    TPackedProviderInstrument,
    TProviderPropertyRow,
} from '../../defs.ts';
import { EDataKind, EPropertyGroup, ProviderInstrumentPropertyName } from '../../defs.ts';
import { packProviderInstruments } from '../../utils/instruments.ts';
import type { TOverrideError } from '../defs.ts';
import { getProviderInstrumentsRow } from '../utils.ts';

export function useTransposeProviderInstruments(
    instrumentsDesc: TValueDescriptor2<TInstrument[]>,
    override: TOverrideProviderInstrument,
    overrideValidation: TOverrideError[],
): TProviderPropertyRow[] | undefined {
    return useMemo(
        () =>
            matchValueDescriptor(instrumentsDesc, {
                unsynced(vd) {
                    return isFailValueDescriptor(vd) ? EMPTY_ARRAY : undefined;
                },
                synced({ value: instruments }): TProviderPropertyRow[] {
                    const packedProviderInstruments = instruments
                        .map((instrument) => packProviderInstruments(instrument, true))
                        .flat();

                    return [
                        ...getProviderBasePropertiesRows(
                            packedProviderInstruments,
                            override,
                            overrideValidation,
                        ),
                        ...getProviderAmountNotationRows(
                            packedProviderInstruments,
                            override,
                            overrideValidation,
                        ),
                        ...getProviderPriceNotationRows(
                            packedProviderInstruments,
                            override,
                            overrideValidation,
                        ),
                        ...getProviderSettlementRows(
                            packedProviderInstruments,
                            override,
                            overrideValidation,
                        ),
                        ...getProviderNotionalRows(
                            packedProviderInstruments,
                            override,
                            overrideValidation,
                        ),
                        ...getProviderUnderlyingRows(
                            packedProviderInstruments,
                            override,
                            overrideValidation,
                        ),
                        ...getProviderSpotRows(
                            packedProviderInstruments,
                            override,
                            overrideValidation,
                        ),
                        ...getProviderStartExpirationRows(
                            packedProviderInstruments,
                            override,
                            overrideValidation,
                        ),
                        ...getProviderPayoutNotationRows(
                            packedProviderInstruments,
                            override,
                            overrideValidation,
                        ),
                        ...getProviderMarginNotationRows(
                            packedProviderInstruments,
                            override,
                            overrideValidation,
                        ),
                        ...getProviderOptionRows(
                            packedProviderInstruments,
                            override,
                            overrideValidation,
                        ),
                        ...getProviderInstrumentSwapRows(
                            packedProviderInstruments,
                            override,
                            overrideValidation,
                        ),
                    ];
                },
            }),
        [instrumentsDesc, override, overrideValidation],
    );
}

function getProviderBasePropertiesRows(
    packedProviderInstruments: TPackedProviderInstrument[],
    override: TOverrideProviderInstrument,
    overrideValidation: TOverrideError[],
): TProviderPropertyRow[] {
    return [
        getProviderInstrumentsRow(
            EPropertyGroup.BaseProperties,
            ProviderInstrumentPropertyName.BasePropertiesName,
            packedProviderInstruments,
            ({ name }) => ({ data: name, kind: EDataKind.String }),
            override,
            overrideValidation,
        ),
        getProviderInstrumentsRow(
            EPropertyGroup.BaseProperties,
            ProviderInstrumentPropertyName.BasePropertiesKind,
            packedProviderInstruments,
            ({ kind }) => ({
                data: isNil(kind) ? undefined : kindToDisplayKind(kind),
                kind: EDataKind.String,
            }),
            override,
            overrideValidation,
        ),
        getProviderInstrumentsRow(
            EPropertyGroup.BaseProperties,
            ProviderInstrumentPropertyName.BasePropertiesSource,
            packedProviderInstruments,
            ({ source }) => ({
                data: providerInstrumentSourceToDisplaySource(source),
                kind: EDataKind.String,
            }),
            override,
            overrideValidation,
        ),
        getProviderInstrumentsRow(
            EPropertyGroup.BaseProperties,
            ProviderInstrumentPropertyName.BasePropertiesDate,
            packedProviderInstruments,
            ({ platformInstrument }) => ({
                data: {
                    date: platformInstrument.platformTime as ISO,
                    instrument: platformInstrument,
                },
                kind: EDataKind.RevisionDateTime,
            }),
            override,
            overrideValidation,
        ),
        getProviderInstrumentsRow(
            EPropertyGroup.BaseProperties,
            ProviderInstrumentPropertyName.BasePropertiesProvider,
            packedProviderInstruments,
            ({ provider }) => ({
                data: provider,
                kind: EDataKind.String,
            }),
            override,
            overrideValidation,
        ),
    ];
}

function getProviderAmountNotationRows(
    packedProviderInstruments: TPackedProviderInstrument[],
    override: TOverrideProviderInstrument,
    overrideValidation: TOverrideError[],
): TProviderPropertyRow[] {
    return [
        getProviderInstrumentsRow(
            EPropertyGroup.AmountNotation,
            ProviderInstrumentPropertyName.AmountNotationAssetName,
            packedProviderInstruments,
            ({ amountNotation }) => ({
                data:
                    amountNotation?.value?.type === 'asset'
                        ? amountNotation.value.asset.assetName
                        : undefined,
                kind: EDataKind.String,
            }),
            override,
            overrideValidation,
        ),
        getProviderInstrumentsRow(
            EPropertyGroup.AmountNotation,
            ProviderInstrumentPropertyName.AmountNotationAssetMultiplier,
            packedProviderInstruments,
            ({ amountNotation }) => ({
                data:
                    amountNotation?.value?.type === 'asset'
                        ? amountNotation.value.asset.multiplier
                        : undefined,
                kind: EDataKind.Number,
            }),
            override,
            overrideValidation,
        ),
        getProviderInstrumentsRow(
            EPropertyGroup.AmountNotation,
            ProviderInstrumentPropertyName.AmountNotationInstrumentName,
            packedProviderInstruments,
            ({ amountNotation }) => ({
                data:
                    amountNotation?.value?.type === 'instrument'
                        ? amountNotation.value.instrument.instrumentName
                        : undefined,
                kind: EDataKind.String,
            }),
            override,
            overrideValidation,
        ),
        getProviderInstrumentsRow(
            EPropertyGroup.AmountNotation,
            ProviderInstrumentPropertyName.AmountNotationInstrumentMultiplier,
            packedProviderInstruments,
            ({ amountNotation }) => ({
                data:
                    amountNotation?.value?.type === 'instrument'
                        ? amountNotation.value.instrument.multiplier
                        : undefined,
                kind: EDataKind.Number,
            }),
            override,
            overrideValidation,
        ),
        getProviderInstrumentsRow(
            EPropertyGroup.AmountNotation,
            ProviderInstrumentPropertyName.AmountNotationIndexName,
            packedProviderInstruments,
            ({ amountNotation }) => ({
                data:
                    amountNotation?.value?.type === 'index'
                        ? amountNotation.value.index.indexName
                        : undefined,
                kind: EDataKind.String,
            }),
            override,
            overrideValidation,
        ),
        getProviderInstrumentsRow(
            EPropertyGroup.AmountNotation,
            ProviderInstrumentPropertyName.AmountNotationIndexMultiplier,
            packedProviderInstruments,
            ({ amountNotation }) => ({
                data:
                    amountNotation?.value?.type === 'index'
                        ? amountNotation.value.index.multiplier
                        : undefined,
                kind: EDataKind.Number,
            }),
            override,
            overrideValidation,
        ),
    ];
}

function getProviderPriceNotationRows(
    packedProviderInstruments: TPackedProviderInstrument[],
    override: TOverrideProviderInstrument,
    overrideValidation: TOverrideError[],
): TProviderPropertyRow[] {
    return [
        getProviderInstrumentsRow(
            EPropertyGroup.PriceNotation,
            ProviderInstrumentPropertyName.PriceNotationNumeratorAssetName,
            packedProviderInstruments,
            ({ priceNotation }) => ({
                data:
                    priceNotation?.value?.ratio.numerator?.value?.type === 'assetName'
                        ? priceNotation.value.ratio.numerator.value.assetName
                        : undefined,
                kind: EDataKind.String,
            }),
            override,
            overrideValidation,
        ),
        getProviderInstrumentsRow(
            EPropertyGroup.PriceNotation,
            ProviderInstrumentPropertyName.PriceNotationNumeratorInstrumentName,
            packedProviderInstruments,
            ({ priceNotation }) => ({
                data:
                    priceNotation?.value?.ratio.numerator?.value?.type === 'instrumentName'
                        ? priceNotation.value.ratio.numerator.value.instrumentName
                        : undefined,
                kind: EDataKind.String,
            }),
            override,
            overrideValidation,
        ),
        getProviderInstrumentsRow(
            EPropertyGroup.PriceNotation,
            ProviderInstrumentPropertyName.PriceNotationNumeratorIndexName,
            packedProviderInstruments,
            ({ priceNotation }) => ({
                data:
                    priceNotation?.value?.ratio.numerator?.value?.type === 'indexName'
                        ? priceNotation.value.ratio.numerator.value.indexName
                        : undefined,
                kind: EDataKind.String,
            }),
            override,
            overrideValidation,
        ),
        getProviderInstrumentsRow(
            EPropertyGroup.PriceNotation,
            ProviderInstrumentPropertyName.PriceNotationDenominatorAssetName,
            packedProviderInstruments,
            ({ priceNotation }) => ({
                data:
                    priceNotation?.value?.ratio.denominator?.value?.type === 'assetName'
                        ? priceNotation.value.ratio.denominator.value.assetName
                        : undefined,
                kind: EDataKind.String,
            }),
            override,
            overrideValidation,
        ),
        getProviderInstrumentsRow(
            EPropertyGroup.PriceNotation,
            ProviderInstrumentPropertyName.PriceNotationDenominatorInstrumentName,
            packedProviderInstruments,
            ({ priceNotation }) => ({
                data:
                    priceNotation?.value?.ratio.denominator?.value?.type === 'instrumentName'
                        ? priceNotation.value.ratio.denominator.value.instrumentName
                        : undefined,
                kind: EDataKind.String,
            }),
            override,
            overrideValidation,
        ),
        getProviderInstrumentsRow(
            EPropertyGroup.PriceNotation,
            ProviderInstrumentPropertyName.PriceNotationDenominatorIndexName,
            packedProviderInstruments,
            ({ priceNotation }) => ({
                data:
                    priceNotation?.value?.ratio.denominator?.value?.type === 'indexName'
                        ? priceNotation.value.ratio.denominator.value.indexName
                        : undefined,
                kind: EDataKind.String,
            }),
            override,
            overrideValidation,
        ),
        getProviderInstrumentsRow(
            EPropertyGroup.PriceNotation,
            ProviderInstrumentPropertyName.PriceNotationDenominatorMultiplier,
            packedProviderInstruments,
            ({ priceNotation }) => ({
                data: priceNotation?.value?.ratio.denominatorMultiplier,
                kind: EDataKind.Number,
            }),
            override,
            overrideValidation,
        ),
    ];
}

function getProviderSettlementRows(
    packedProviderInstruments: TPackedProviderInstrument[],
    override: TOverrideProviderInstrument,
    overrideValidation: TOverrideError[],
): TProviderPropertyRow[] {
    return [
        getProviderInstrumentsRow(
            EPropertyGroup.Settlement,
            ProviderInstrumentPropertyName.SettlementType,
            packedProviderInstruments,
            ({ settlement }) => ({
                data: isNil(settlement?.type)
                    ? undefined
                    : settlementTypeToDisplaySettlementType(settlement.type.type),
                kind: EDataKind.String,
            }),
            override,
            overrideValidation,
        ),
        getProviderInstrumentsRow(
            EPropertyGroup.Settlement,
            ProviderInstrumentPropertyName.SettlementTime,
            packedProviderInstruments,
            ({ settlement }) => ({
                data: settlement?.time,
                kind: EDataKind.DateTime,
            }),
            override,
            overrideValidation,
        ),
        getProviderInstrumentsRow(
            EPropertyGroup.Settlement,
            ProviderInstrumentPropertyName.SettlementAssetName,
            packedProviderInstruments,
            ({ settlement }) => ({
                data:
                    settlement?.type?.type === 'financiallySettled'
                        ? settlement.type.financiallySettled.assetName
                        : settlement?.type?.type === 'physicallyDelivered'
                          ? settlement.type.physicallyDelivered.assetName
                          : undefined,
                kind: EDataKind.String,
            }),
            override,
            overrideValidation,
        ),
        getProviderInstrumentsRow(
            EPropertyGroup.Settlement,
            ProviderInstrumentPropertyName.SettlementAssetsPerContract,
            packedProviderInstruments,
            ({ settlement }) => ({
                data:
                    settlement?.type?.type === 'physicallyDelivered'
                        ? settlement.type.physicallyDelivered.assetsPerContract
                        : undefined,
                kind: EDataKind.Number,
            }),
            override,
            overrideValidation,
        ),
        getProviderInstrumentsRow(
            EPropertyGroup.Settlement,
            ProviderInstrumentPropertyName.SettlementInstrumentName,
            packedProviderInstruments,
            ({ settlement }) => ({
                data:
                    settlement?.type?.type === 'exercisesIntoInstrument'
                        ? settlement.type.exercisesIntoInstrument.instrumentName
                        : undefined,
                kind: EDataKind.String,
            }),
            override,
            overrideValidation,
        ),
        getProviderInstrumentsRow(
            EPropertyGroup.Settlement,
            ProviderInstrumentPropertyName.SettlementInstrumentsPerContract,
            packedProviderInstruments,
            ({ settlement }) => ({
                data:
                    settlement?.type?.type === 'exercisesIntoInstrument'
                        ? settlement.type.exercisesIntoInstrument.instrumentsPerContract
                        : undefined,
                kind: EDataKind.Number,
            }),
            override,
            overrideValidation,
        ),
    ];
}

function getProviderNotionalRows(
    packedProviderInstruments: TPackedProviderInstrument[],
    override: TOverrideProviderInstrument,
    overrideValidation: TOverrideError[],
): TProviderPropertyRow[] {
    return [
        getProviderInstrumentsRow(
            EPropertyGroup.Notional,
            ProviderInstrumentPropertyName.NotionalKind,
            packedProviderInstruments,
            ({ notional }) => ({
                data: isNil(notional?.type)
                    ? undefined
                    : instrumentNotionalTypeToDisplayType(notional.type),
                kind: EDataKind.String,
            }),
            override,
            overrideValidation,
        ),
        getProviderInstrumentsRow(
            EPropertyGroup.Notional,
            ProviderInstrumentPropertyName.NotionalAssetName,
            packedProviderInstruments,
            ({ notional }) => ({
                data: notional?.type === 'asset' ? notional.asset.assetName : undefined,
                kind: EDataKind.String,
            }),
            override,
            overrideValidation,
        ),
        getProviderInstrumentsRow(
            EPropertyGroup.Notional,
            ProviderInstrumentPropertyName.NotionalAssetsPerContract,
            packedProviderInstruments,
            ({ notional }) => ({
                data: notional?.type === 'asset' ? notional.asset.assetsPerContract : undefined,
                kind: EDataKind.Number,
            }),
            override,
            overrideValidation,
        ),
        getProviderInstrumentsRow(
            EPropertyGroup.Notional,
            ProviderInstrumentPropertyName.NotionalInstrumentName,
            packedProviderInstruments,
            ({ notional }) => ({
                data:
                    notional?.type === 'instrument'
                        ? notional.instrument.instrumentName
                        : undefined,
                kind: EDataKind.String,
            }),
            override,
            overrideValidation,
        ),
        getProviderInstrumentsRow(
            EPropertyGroup.Notional,
            ProviderInstrumentPropertyName.NotionalInstrumentsPerContract,
            packedProviderInstruments,
            ({ notional }) => ({
                data:
                    notional?.type === 'instrument'
                        ? notional.instrument.instrumentsPerContract
                        : undefined,
                kind: EDataKind.Number,
            }),
            override,
            overrideValidation,
        ),
        getProviderInstrumentsRow(
            EPropertyGroup.Notional,
            ProviderInstrumentPropertyName.NotionalFactor,
            packedProviderInstruments,
            ({ notional }) => ({
                data:
                    notional?.type === 'priceProportional'
                        ? notional.priceProportional.factor
                        : undefined,
                kind: EDataKind.Number,
            }),
            override,
            overrideValidation,
        ),
        getProviderInstrumentsRow(
            EPropertyGroup.Notional,
            ProviderInstrumentPropertyName.NotionalNotationAssetName,
            packedProviderInstruments,
            ({ notional }) => ({
                data:
                    notional?.type === 'priceProportional'
                        ? notional.priceProportional.notationAssetName
                        : undefined,
                kind: EDataKind.String,
            }),
            override,
            overrideValidation,
        ),
        getProviderInstrumentsRow(
            EPropertyGroup.Notional,
            ProviderInstrumentPropertyName.NotionalPriceSourceInstrumentName,
            packedProviderInstruments,
            ({ notional }) => ({
                data:
                    notional?.type === 'priceProportional' &&
                    notional.priceProportional.priceSource?.value?.type === 'instrumentName'
                        ? notional.priceProportional.priceSource.value.instrumentName
                        : undefined,
                kind: EDataKind.String,
            }),
            override,
            overrideValidation,
        ),
        getProviderInstrumentsRow(
            EPropertyGroup.Notional,
            ProviderInstrumentPropertyName.NotionalPriceSourceIndexName,
            packedProviderInstruments,
            ({ notional }) => ({
                data:
                    notional?.type === 'priceProportional' &&
                    notional.priceProportional.priceSource?.value?.type === 'indexName'
                        ? notional.priceProportional.priceSource.value.indexName
                        : undefined,
                kind: EDataKind.String,
            }),
            override,
            overrideValidation,
        ),
    ];
}

function getProviderUnderlyingRows(
    packedProviderInstruments: TPackedProviderInstrument[],
    override: TOverrideProviderInstrument,
    overrideValidation: TOverrideError[],
): TProviderPropertyRow[] {
    return [
        getProviderInstrumentsRow(
            EPropertyGroup.Underlying,
            ProviderInstrumentPropertyName.UnderlyingAssetName,
            packedProviderInstruments,
            ({ underlying }) => ({
                data: underlying?.type === 'assetName' ? underlying.assetName : undefined,
                kind: EDataKind.String,
            }),
            override,
            overrideValidation,
        ),
        getProviderInstrumentsRow(
            EPropertyGroup.Underlying,
            ProviderInstrumentPropertyName.UnderlyingInstrumentName,
            packedProviderInstruments,
            ({ underlying }) => ({
                data: underlying?.type === 'instrumentName' ? underlying.instrumentName : undefined,
                kind: EDataKind.String,
            }),
            override,
            overrideValidation,
        ),
        getProviderInstrumentsRow(
            EPropertyGroup.Underlying,
            ProviderInstrumentPropertyName.UnderlyingIndexName,
            packedProviderInstruments,
            ({ underlying }) => ({
                data: underlying?.type === 'indexName' ? underlying.indexName : undefined,
                kind: EDataKind.String,
            }),
            override,
            overrideValidation,
        ),
    ];
}

function getProviderSpotRows(
    packedProviderInstruments: TPackedProviderInstrument[],
    override: TOverrideProviderInstrument,
    overrideValidation: TOverrideError[],
): TProviderPropertyRow[] {
    return [
        getProviderInstrumentsRow(
            EPropertyGroup.Spot,
            ProviderInstrumentPropertyName.SpotBaseAssetName,
            packedProviderInstruments,
            ({ baseAssetName }) => ({
                data: baseAssetName,
                kind: EDataKind.String,
            }),
            override,
            overrideValidation,
        ),
        getProviderInstrumentsRow(
            EPropertyGroup.Spot,
            ProviderInstrumentPropertyName.SpotQuoteAssetName,
            packedProviderInstruments,
            ({ quoteAssetName }) => ({
                data: quoteAssetName,
                kind: EDataKind.String,
            }),
            override,
            overrideValidation,
        ),
    ];
}

function getProviderStartExpirationRows(
    packedProviderInstruments: TPackedProviderInstrument[],
    override: TOverrideProviderInstrument,
    overrideValidation: TOverrideError[],
): TProviderPropertyRow[] {
    return [
        getProviderInstrumentsRow(
            EPropertyGroup.StartExpiration,
            ProviderInstrumentPropertyName.StartExpirationStartTime,
            packedProviderInstruments,
            ({ startTime }) => ({
                data: startTime as ISO,
                kind: EDataKind.DateTime,
            }),
            override,
            overrideValidation,
        ),
        getProviderInstrumentsRow(
            EPropertyGroup.StartExpiration,
            ProviderInstrumentPropertyName.StartExpirationExpirationTime,
            packedProviderInstruments,
            ({ expirationTime }) => ({
                data: expirationTime as ISO,
                kind: EDataKind.DateTime,
            }),
            override,
            overrideValidation,
        ),
    ];
}

function getProviderPayoutNotationRows(
    packedProviderInstruments: TPackedProviderInstrument[],
    override: TOverrideProviderInstrument,
    overrideValidation: TOverrideError[],
): TProviderPropertyRow[] {
    return [
        getProviderInstrumentsRow(
            EPropertyGroup.PayoutNotation,
            ProviderInstrumentPropertyName.PayoutNotationUnitAssetName,
            packedProviderInstruments,
            ({ payoutNotation }) => ({
                data:
                    payoutNotation?.payoutUnit?.value?.type === 'assetName'
                        ? payoutNotation.payoutUnit.value.assetName
                        : undefined,
                kind: EDataKind.String,
            }),
            override,
            overrideValidation,
        ),
        getProviderInstrumentsRow(
            EPropertyGroup.PayoutNotation,
            ProviderInstrumentPropertyName.PayoutNotationFunction,
            packedProviderInstruments,
            ({ payoutNotation }) => ({
                data: isNil(payoutNotation)
                    ? undefined
                    : instrumentPayoutFunctionToDisplayPayoutFunction(
                          payoutNotation.payoutFunction,
                      ),
                kind: EDataKind.String,
            }),
            override,
            overrideValidation,
        ),
    ];
}

function getProviderMarginNotationRows(
    packedProviderInstruments: TPackedProviderInstrument[],
    override: TOverrideProviderInstrument,
    overrideValidation: TOverrideError[],
): TProviderPropertyRow[] {
    return [
        getProviderInstrumentsRow(
            EPropertyGroup.MarginNotation,
            ProviderInstrumentPropertyName.MarginNotationAssetName,
            packedProviderInstruments,
            ({ marginNotation }) => ({
                data:
                    isNil(marginNotation) || marginNotation.type !== 'assetName'
                        ? undefined
                        : marginNotation.assetName,
                kind: EDataKind.String,
            }),
            override,
            overrideValidation,
        ),
    ];
}

function getProviderOptionRows(
    packedProviderInstruments: TPackedProviderInstrument[],
    override: TOverrideProviderInstrument,
    overrideValidation: TOverrideError[],
): TProviderPropertyRow[] {
    return [
        getProviderInstrumentsRow(
            EPropertyGroup.Option,
            ProviderInstrumentPropertyName.OptionCollateralizingType,
            packedProviderInstruments,
            ({ option }) => ({
                data:
                    isNil(option) || isNil(option.collateralizingType)
                        ? undefined
                        : instrumentCollateralizingTypeToDisplayType(option.collateralizingType),
                kind: EDataKind.String,
            }),
            override,
            overrideValidation,
        ),
        getProviderInstrumentsRow(
            EPropertyGroup.Option,
            ProviderInstrumentPropertyName.OptionType,
            packedProviderInstruments,
            ({ option }) => ({
                data:
                    isNil(option) || isNil(option.optionType)
                        ? undefined
                        : instrumentOptionTypeToDisplayType(option.optionType),
                kind: EDataKind.String,
            }),
            override,
            overrideValidation,
        ),
        getProviderInstrumentsRow(
            EPropertyGroup.Option,
            ProviderInstrumentPropertyName.OptionStyle,
            packedProviderInstruments,
            ({ option }) => ({
                data:
                    isNil(option) || isNil(option.optionStyle?.value?.type)
                        ? undefined
                        : instrumentOptionStyleToDisplayStyle(option.optionStyle.value.type),
                kind: EDataKind.String,
            }),
            override,
            overrideValidation,
        ),
        getProviderInstrumentsRow(
            EPropertyGroup.Option,
            ProviderInstrumentPropertyName.OptionStrikePrice,
            packedProviderInstruments,
            ({ option }) => ({
                data: option?.strikePrice,
                kind: EDataKind.Number,
            }),
            override,
            overrideValidation,
        ),
    ];
}

function getProviderInstrumentSwapRows(
    packedProviderInstruments: TPackedProviderInstrument[],
    override: TOverrideProviderInstrument,
    overrideValidation: TOverrideError[],
): TProviderPropertyRow[] {
    return [
        getProviderInstrumentsRow(
            EPropertyGroup.InstrumentSwap,
            ProviderInstrumentPropertyName.InstrumentSwapBuyInstrumentName,
            packedProviderInstruments,
            ({ instrumentSwap }) => ({
                data: instrumentSwap?.buyInstrumentName,
                kind: EDataKind.String,
            }),
            override,
            overrideValidation,
        ),
        getProviderInstrumentsRow(
            EPropertyGroup.InstrumentSwap,
            ProviderInstrumentPropertyName.InstrumentSwapSellInstrumentName,
            packedProviderInstruments,
            ({ instrumentSwap }) => ({
                data: instrumentSwap?.sellInstrumentName,
                kind: EDataKind.String,
            }),
            override,
            overrideValidation,
        ),
    ];
}
