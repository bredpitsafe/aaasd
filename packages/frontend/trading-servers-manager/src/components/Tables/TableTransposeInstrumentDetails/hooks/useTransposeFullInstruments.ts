import type { ISO } from '@common/types';
import { EMPTY_ARRAY } from '@frontend/common/src/utils/const.ts';
import {
    instrumentCollateralizingTypeToDisplayType,
    instrumentNotionalTypeToDisplayType,
    instrumentOptionStyleToDisplayStyle,
    instrumentOptionTypeToDisplayType,
    instrumentPayoutFunctionToDisplayPayoutFunction,
    kindToDisplayKind,
    settlementTypeToDisplaySettlementType,
} from '@frontend/common/src/utils/instruments/converters.ts';
import { getInstrumentStepQty } from '@frontend/common/src/utils/instruments/getInstrumentStepQty.ts';
import type { TValueDescriptor2 } from '@frontend/common/src/utils/ValueDescriptor/types.ts';
import {
    isFailValueDescriptor,
    matchValueDescriptor,
} from '@frontend/common/src/utils/ValueDescriptor/utils.ts';
import { isNil } from 'lodash-es';
import { useMemo } from 'react';

import type { TFullInstrument, TPackedFullInstrument, TPropertyRow } from '../../defs.ts';
import { EDataKind, EPropertyGroup, InstrumentPropertyName } from '../../defs.ts';
import { getInstrumentsRow, packFullInstrument } from '../utils.ts';

export function useTransposeFullInstruments(
    fullInstrumentsDesc: TValueDescriptor2<TFullInstrument[]>,
): TPropertyRow[] | undefined {
    return useMemo(
        () =>
            matchValueDescriptor(fullInstrumentsDesc, {
                unsynced(vd) {
                    return isFailValueDescriptor(vd) ? EMPTY_ARRAY : undefined;
                },
                synced({ value }): TPropertyRow[] {
                    const packedFullInstruments = value.map(packFullInstrument);

                    return [
                        ...getBasePropertiesRows(packedFullInstruments),
                        ...getDynamicDataRows(packedFullInstruments),
                        ...getAmountNotationRows(packedFullInstruments),
                        ...getPriceNotationRows(packedFullInstruments),
                        ...getSettlementRows(packedFullInstruments),
                        ...getNotionalRows(packedFullInstruments),
                        ...getUnderlyingRows(packedFullInstruments),
                        ...getSpotRows(packedFullInstruments),
                        ...getStartExpirationRows(packedFullInstruments),
                        ...getPayoutNotationRows(packedFullInstruments),
                        ...getMarginNotationRows(packedFullInstruments),
                        ...getOptionRows(packedFullInstruments),
                        ...getInstrumentSwapRows(packedFullInstruments),
                        ...getRevisionRows(packedFullInstruments),
                    ];
                },
            }),
        [fullInstrumentsDesc],
    );
}

function getBasePropertiesRows(packedFullInstruments: TPackedFullInstrument[]): TPropertyRow[] {
    return [
        getInstrumentsRow(
            EPropertyGroup.BaseProperties,
            InstrumentPropertyName.BasePropertiesId,
            packedFullInstruments,
            ({ id }) => ({
                data: id,
                kind: EDataKind.Number,
            }),
        ),
        getInstrumentsRow(
            EPropertyGroup.BaseProperties,
            InstrumentPropertyName.BasePropertiesName,
            packedFullInstruments,
            ({ name }) => ({
                data: name,
                kind: EDataKind.String,
            }),
        ),
        getInstrumentsRow(
            EPropertyGroup.BaseProperties,
            InstrumentPropertyName.BasePropertiesKind,
            packedFullInstruments,
            ({ kind }) => ({
                data: isNil(kind) ? undefined : kindToDisplayKind(kind),
                kind: EDataKind.String,
            }),
        ),
        getInstrumentsRow(
            EPropertyGroup.BaseProperties,
            InstrumentPropertyName.BasePropertiesApprovalStatus,
            packedFullInstruments,
            ({ instrument }) => ({ data: instrument, kind: EDataKind.InstrumentApprovalStatus }),
        ),
        getInstrumentsRow(
            EPropertyGroup.BaseProperties,
            InstrumentPropertyName.BasePropertiesStatus,
            packedFullInstruments,
            ({ status }) => ({
                data: status,
                kind: EDataKind.DynamicDataStatus,
            }),
        ),
        getInstrumentsRow(
            EPropertyGroup.BaseProperties,
            InstrumentPropertyName.BasePropertiesExchange,
            packedFullInstruments,
            ({ exchange }) => ({
                data: exchange,
                kind: EDataKind.String,
            }),
        ),
    ];
}

function getDynamicDataRows(packedFullInstruments: TPackedFullInstrument[]): TPropertyRow[] {
    return [
        getInstrumentsRow(
            EPropertyGroup.DynamicData,
            InstrumentPropertyName.DynamicDataMinPrice,
            packedFullInstruments,
            ({ minPrice }) => ({
                data: minPrice,
                kind: EDataKind.Number,
            }),
        ),
        getInstrumentsRow(
            EPropertyGroup.DynamicData,
            InstrumentPropertyName.DynamicDataMaxPrice,
            packedFullInstruments,
            ({ maxPrice }) => ({
                data: maxPrice,
                kind: EDataKind.Number,
            }),
        ),
        getInstrumentsRow(
            EPropertyGroup.DynamicData,
            InstrumentPropertyName.DynamicDataMinQty,
            packedFullInstruments,
            ({ minQty }) => ({
                data: minQty,
                kind: EDataKind.Number,
            }),
        ),
        getInstrumentsRow(
            EPropertyGroup.DynamicData,
            InstrumentPropertyName.DynamicDataMaxQty,
            packedFullInstruments,
            ({ maxQty }) => ({
                data: maxQty,
                kind: EDataKind.Number,
            }),
        ),
        getInstrumentsRow(
            EPropertyGroup.DynamicData,
            InstrumentPropertyName.DynamicDataMinVolume,
            packedFullInstruments,
            ({ minVolume }) => ({
                data: minVolume,
                kind: EDataKind.Number,
            }),
        ),
        getInstrumentsRow(
            EPropertyGroup.DynamicData,
            InstrumentPropertyName.DynamicDataStepPrice,
            packedFullInstruments,
            ({ priceStepRules }) => ({
                data: priceStepRules,
                kind: EDataKind.StepPrice,
            }),
        ),
        getInstrumentsRow(
            EPropertyGroup.DynamicData,
            InstrumentPropertyName.DynamicDataStepQty,
            packedFullInstruments,
            ({ amountStepRules }) => ({
                data: getInstrumentStepQty(amountStepRules),
                kind: EDataKind.Number,
            }),
        ),
    ];
}

function getAmountNotationRows(packedFullInstruments: TPackedFullInstrument[]): TPropertyRow[] {
    return [
        getInstrumentsRow(
            EPropertyGroup.AmountNotation,
            InstrumentPropertyName.AmountNotationAssetId,
            packedFullInstruments,
            ({ amountNotation }) => ({
                data:
                    amountNotation?.value?.type === 'asset'
                        ? amountNotation?.value.asset.assetId
                        : undefined,
                kind: EDataKind.Number,
            }),
        ),
        getInstrumentsRow(
            EPropertyGroup.AmountNotation,
            InstrumentPropertyName.AmountNotationAssetMultiplier,
            packedFullInstruments,
            ({ amountNotation }) => ({
                data:
                    amountNotation?.value?.type === 'asset'
                        ? amountNotation?.value.asset.multiplier
                        : undefined,
                kind: EDataKind.Number,
            }),
        ),
        getInstrumentsRow(
            EPropertyGroup.AmountNotation,
            InstrumentPropertyName.AmountNotationInstrumentId,
            packedFullInstruments,
            ({ amountNotation }) => ({
                data:
                    amountNotation?.value?.type === 'instrument'
                        ? amountNotation?.value.instrument.instrumentId
                        : undefined,
                kind: EDataKind.Number,
            }),
        ),
        getInstrumentsRow(
            EPropertyGroup.AmountNotation,
            InstrumentPropertyName.AmountNotationInstrumentMultiplier,
            packedFullInstruments,
            ({ amountNotation }) => ({
                data:
                    amountNotation?.value?.type === 'instrument'
                        ? amountNotation?.value.instrument.multiplier
                        : undefined,
                kind: EDataKind.Number,
            }),
        ),
        getInstrumentsRow(
            EPropertyGroup.AmountNotation,
            InstrumentPropertyName.AmountNotationIndexId,
            packedFullInstruments,
            ({ amountNotation }) => ({
                data:
                    amountNotation?.value?.type === 'index'
                        ? amountNotation?.value.index.indexId
                        : undefined,
                kind: EDataKind.Number,
            }),
        ),
        getInstrumentsRow(
            EPropertyGroup.AmountNotation,
            InstrumentPropertyName.AmountNotationIndexMultiplier,
            packedFullInstruments,
            ({ amountNotation }) => ({
                data:
                    amountNotation?.value?.type === 'index'
                        ? amountNotation?.value.index.multiplier
                        : undefined,
                kind: EDataKind.Number,
            }),
        ),
    ];
}

function getPriceNotationRows(packedFullInstruments: TPackedFullInstrument[]): TPropertyRow[] {
    if (packedFullInstruments.every(({ priceNotation }) => isNil(priceNotation))) {
        return EMPTY_ARRAY;
    }

    return [
        getInstrumentsRow(
            EPropertyGroup.PriceNotation,
            InstrumentPropertyName.PriceNotationNumeratorAssetId,
            packedFullInstruments,
            ({ priceNotation }) => ({
                data:
                    priceNotation?.value?.ratio.numerator.value?.type === 'assetId'
                        ? priceNotation.value.ratio.numerator.value.assetId
                        : undefined,
                kind: EDataKind.Number,
            }),
        ),
        getInstrumentsRow(
            EPropertyGroup.PriceNotation,
            InstrumentPropertyName.PriceNotationNumeratorInstrumentId,
            packedFullInstruments,
            ({ priceNotation }) => ({
                data:
                    priceNotation?.value?.ratio.numerator.value?.type === 'instrumentId'
                        ? priceNotation.value.ratio.numerator.value.instrumentId
                        : undefined,
                kind: EDataKind.Number,
            }),
        ),
        getInstrumentsRow(
            EPropertyGroup.PriceNotation,
            InstrumentPropertyName.PriceNotationNumeratorIndexId,
            packedFullInstruments,
            ({ priceNotation }) => ({
                data:
                    priceNotation?.value?.ratio?.numerator.value?.type === 'indexId'
                        ? priceNotation.value.ratio.numerator.value.indexId
                        : undefined,
                kind: EDataKind.Number,
            }),
        ),
        getInstrumentsRow(
            EPropertyGroup.PriceNotation,
            InstrumentPropertyName.PriceNotationDenominatorAssetId,
            packedFullInstruments,
            ({ priceNotation }) => ({
                data:
                    priceNotation?.value?.ratio.denominator.value?.type === 'assetId'
                        ? priceNotation.value.ratio.denominator.value.assetId
                        : undefined,
                kind: EDataKind.Number,
            }),
        ),
        getInstrumentsRow(
            EPropertyGroup.PriceNotation,
            InstrumentPropertyName.PriceNotationDenominatorInstrumentId,
            packedFullInstruments,
            ({ priceNotation }) => ({
                data:
                    priceNotation?.value?.ratio.denominator.value?.type === 'instrumentId'
                        ? priceNotation.value.ratio.denominator.value.instrumentId
                        : undefined,
                kind: EDataKind.Number,
            }),
        ),
        getInstrumentsRow(
            EPropertyGroup.PriceNotation,
            InstrumentPropertyName.PriceNotationDenominatorIndexId,
            packedFullInstruments,
            ({ priceNotation }) => ({
                data:
                    priceNotation?.value?.ratio.denominator.value?.type === 'indexId'
                        ? priceNotation.value.ratio.denominator.value.indexId
                        : undefined,
                kind: EDataKind.Number,
            }),
        ),
        getInstrumentsRow(
            EPropertyGroup.PriceNotation,
            InstrumentPropertyName.PriceNotationDenominatorMultiplier,
            packedFullInstruments,
            ({ priceNotation }) => ({
                data: priceNotation?.value?.ratio.denominatorMultiplier,
                kind: EDataKind.Number,
            }),
        ),
    ];
}

function getSettlementRows(packedFullInstruments: TPackedFullInstrument[]): TPropertyRow[] {
    if (packedFullInstruments.every(({ settlement }) => isNil(settlement))) {
        return EMPTY_ARRAY;
    }

    return [
        getInstrumentsRow(
            EPropertyGroup.Settlement,
            InstrumentPropertyName.SettlementType,
            packedFullInstruments,
            ({ settlement }) => ({
                data: isNil(settlement?.type?.type)
                    ? undefined
                    : settlementTypeToDisplaySettlementType(settlement.type.type),
                kind: EDataKind.String,
            }),
        ),
        getInstrumentsRow(
            EPropertyGroup.Settlement,
            InstrumentPropertyName.SettlementTime,
            packedFullInstruments,
            ({ settlement }) => ({
                data: settlement?.time,
                kind: EDataKind.DateTime,
            }),
        ),
        getInstrumentsRow(
            EPropertyGroup.Settlement,
            InstrumentPropertyName.SettlementAssetId,
            packedFullInstruments,
            ({ settlement }) => ({
                data:
                    settlement?.type?.type === 'financiallySettled'
                        ? settlement.type.financiallySettled.assetId
                        : settlement?.type?.type === 'physicallyDelivered'
                          ? settlement.type.physicallyDelivered.assetId
                          : undefined,
                kind: EDataKind.Number,
            }),
        ),
        getInstrumentsRow(
            EPropertyGroup.Settlement,
            InstrumentPropertyName.SettlementAssetsPerContract,
            packedFullInstruments,
            ({ settlement }) => ({
                data:
                    settlement?.type?.type === 'physicallyDelivered'
                        ? settlement.type.physicallyDelivered.assetsPerContract
                        : undefined,
                kind: EDataKind.Number,
            }),
        ),
        getInstrumentsRow(
            EPropertyGroup.Settlement,
            InstrumentPropertyName.SettlementInstrumentId,
            packedFullInstruments,
            ({ settlement }) => ({
                data:
                    settlement?.type?.type === 'exercisesIntoInstrument'
                        ? settlement.type.exercisesIntoInstrument.instrumentId
                        : undefined,
                kind: EDataKind.Number,
            }),
        ),
        getInstrumentsRow(
            EPropertyGroup.Settlement,
            InstrumentPropertyName.SettlementInstrumentsPerContract,
            packedFullInstruments,
            ({ settlement }) => ({
                data:
                    settlement?.type?.type === 'exercisesIntoInstrument'
                        ? settlement.type.exercisesIntoInstrument.instrumentsPerContract
                        : undefined,
                kind: EDataKind.Number,
            }),
        ),
    ];
}

function getNotionalRows(packedFullInstruments: TPackedFullInstrument[]): TPropertyRow[] {
    if (packedFullInstruments.every(({ notional }) => isNil(notional))) {
        return EMPTY_ARRAY;
    }

    return [
        getInstrumentsRow(
            EPropertyGroup.Notional,
            InstrumentPropertyName.NotionalKind,
            packedFullInstruments,
            ({ notional }) => ({
                data: isNil(notional?.type)
                    ? undefined
                    : instrumentNotionalTypeToDisplayType(notional.type),
                kind: EDataKind.String,
            }),
        ),
        getInstrumentsRow(
            EPropertyGroup.Notional,
            InstrumentPropertyName.NotionalAssetId,
            packedFullInstruments,
            ({ notional }) => ({
                data: notional?.type === 'asset' ? notional.asset.assetId : undefined,
                kind: EDataKind.Number,
            }),
        ),
        getInstrumentsRow(
            EPropertyGroup.Notional,
            InstrumentPropertyName.NotionalAssetsPerContract,
            packedFullInstruments,
            ({ notional }) => ({
                data: notional?.type === 'asset' ? notional.asset.assetsPerContract : undefined,
                kind: EDataKind.Number,
            }),
        ),
        getInstrumentsRow(
            EPropertyGroup.Notional,
            InstrumentPropertyName.NotionalInstrumentId,
            packedFullInstruments,
            ({ notional }) => ({
                data:
                    notional?.type === 'instrument' ? notional.instrument.instrumentId : undefined,
                kind: EDataKind.Number,
            }),
        ),
        getInstrumentsRow(
            EPropertyGroup.Notional,
            InstrumentPropertyName.NotionalInstrumentsPerContract,
            packedFullInstruments,
            ({ notional }) => ({
                data:
                    notional?.type === 'instrument'
                        ? notional.instrument.instrumentsPerContract
                        : undefined,
                kind: EDataKind.Number,
            }),
        ),
        getInstrumentsRow(
            EPropertyGroup.Notional,
            InstrumentPropertyName.NotionalFactor,
            packedFullInstruments,
            ({ notional }) => ({
                data:
                    notional?.type === 'priceProportional'
                        ? notional.priceProportional.factor
                        : undefined,
                kind: EDataKind.Number,
            }),
        ),
        getInstrumentsRow(
            EPropertyGroup.Notional,
            InstrumentPropertyName.NotionalNotationAssetId,
            packedFullInstruments,
            ({ notional }) => ({
                data:
                    notional?.type === 'priceProportional'
                        ? notional.priceProportional.notationAssetId
                        : undefined,
                kind: EDataKind.Number,
            }),
        ),
        getInstrumentsRow(
            EPropertyGroup.Notional,
            InstrumentPropertyName.NotionalPriceSourceInstrumentId,
            packedFullInstruments,
            ({ notional }) => ({
                data:
                    notional?.type === 'priceProportional' &&
                    notional.priceProportional.priceSource.value?.type === 'instrumentId'
                        ? notional.priceProportional.priceSource.value.instrumentId
                        : undefined,
                kind: EDataKind.Number,
            }),
        ),
        getInstrumentsRow(
            EPropertyGroup.Notional,
            InstrumentPropertyName.NotionalPriceSourceIndexId,
            packedFullInstruments,
            ({ notional }) => ({
                data:
                    notional?.type === 'priceProportional' &&
                    notional.priceProportional.priceSource.value?.type === 'indexId'
                        ? notional.priceProportional.priceSource.value.indexId
                        : undefined,
                kind: EDataKind.Number,
            }),
        ),
    ];
}

function getUnderlyingRows(packedFullInstruments: TPackedFullInstrument[]): TPropertyRow[] {
    if (packedFullInstruments.every(({ underlying }) => isNil(underlying))) {
        return EMPTY_ARRAY;
    }

    return [
        getInstrumentsRow(
            EPropertyGroup.Underlying,
            InstrumentPropertyName.UnderlyingAssetId,
            packedFullInstruments,
            ({ underlying }) => ({
                data: underlying?.type === 'assetId' ? underlying.assetId : undefined,
                kind: EDataKind.Number,
            }),
        ),
        getInstrumentsRow(
            EPropertyGroup.Underlying,
            InstrumentPropertyName.UnderlyingInstrumentId,
            packedFullInstruments,
            ({ underlying }) => ({
                data: underlying?.type === 'instrumentId' ? underlying.instrumentId : undefined,
                kind: EDataKind.Number,
            }),
        ),
        getInstrumentsRow(
            EPropertyGroup.Underlying,
            InstrumentPropertyName.UnderlyingIndexId,
            packedFullInstruments,
            ({ underlying }) => ({
                data: underlying?.type === 'indexId' ? underlying.indexId : undefined,
                kind: EDataKind.Number,
            }),
        ),
    ];
}

function getSpotRows(packedFullInstruments: TPackedFullInstrument[]): TPropertyRow[] {
    if (
        packedFullInstruments.every(
            ({ baseAssetId, quoteAssetId }) => isNil(baseAssetId) && isNil(quoteAssetId),
        )
    ) {
        return EMPTY_ARRAY;
    }

    return [
        getInstrumentsRow(
            EPropertyGroup.Spot,
            InstrumentPropertyName.SpotBaseAssetId,
            packedFullInstruments,
            ({ baseAssetId }) => ({
                data: baseAssetId,
                kind: EDataKind.Number,
            }),
        ),
        getInstrumentsRow(
            EPropertyGroup.Spot,
            InstrumentPropertyName.SpotQuoteAssetId,
            packedFullInstruments,
            ({ quoteAssetId }) => ({
                data: quoteAssetId,
                kind: EDataKind.Number,
            }),
        ),
    ];
}

function getStartExpirationRows(packedFullInstruments: TPackedFullInstrument[]): TPropertyRow[] {
    if (
        packedFullInstruments.every(
            ({ startTime, expirationTime }) => isNil(startTime) && isNil(expirationTime),
        )
    ) {
        return EMPTY_ARRAY;
    }

    return [
        getInstrumentsRow(
            EPropertyGroup.StartExpiration,
            InstrumentPropertyName.StartExpirationStartTime,
            packedFullInstruments,
            ({ startTime }) => ({
                data: startTime as ISO,
                kind: EDataKind.DateTime,
            }),
        ),
        getInstrumentsRow(
            EPropertyGroup.StartExpiration,
            InstrumentPropertyName.StartExpirationExpirationTime,
            packedFullInstruments,
            ({ expirationTime }) => ({
                data: expirationTime as ISO,
                kind: EDataKind.DateTime,
            }),
        ),
    ];
}

function getPayoutNotationRows(packedFullInstruments: TPackedFullInstrument[]): TPropertyRow[] {
    if (packedFullInstruments.every(({ payoutNotation }) => isNil(payoutNotation))) {
        return EMPTY_ARRAY;
    }

    return [
        getInstrumentsRow(
            EPropertyGroup.PayoutNotation,
            InstrumentPropertyName.PayoutNotationUnitAssetId,
            packedFullInstruments,
            ({ payoutNotation }) => ({
                data:
                    payoutNotation?.payoutUnit.value?.type === 'assetId'
                        ? payoutNotation.payoutUnit.value.assetId
                        : undefined,
                kind: EDataKind.Number,
            }),
        ),
        getInstrumentsRow(
            EPropertyGroup.PayoutNotation,
            InstrumentPropertyName.PayoutNotationFunction,
            packedFullInstruments,
            ({ payoutNotation }) => ({
                data: isNil(payoutNotation)
                    ? undefined
                    : instrumentPayoutFunctionToDisplayPayoutFunction(
                          payoutNotation.payoutFunction,
                      ),
                kind: EDataKind.String,
            }),
        ),
    ];
}

function getMarginNotationRows(packedFullInstruments: TPackedFullInstrument[]): TPropertyRow[] {
    if (packedFullInstruments.every(({ marginNotation }) => isNil(marginNotation))) {
        return EMPTY_ARRAY;
    }

    return [
        getInstrumentsRow(
            EPropertyGroup.MarginNotation,
            InstrumentPropertyName.MarginNotationAssetId,
            packedFullInstruments,
            ({ marginNotation }) => ({
                data:
                    isNil(marginNotation) || marginNotation.type !== 'assetId'
                        ? undefined
                        : marginNotation.assetId,
                kind: EDataKind.Number,
            }),
        ),
    ];
}

function getOptionRows(packedFullInstruments: TPackedFullInstrument[]): TPropertyRow[] {
    if (packedFullInstruments.every(({ option }) => isNil(option))) {
        return EMPTY_ARRAY;
    }

    return [
        getInstrumentsRow(
            EPropertyGroup.Option,
            InstrumentPropertyName.OptionCollateralizingType,
            packedFullInstruments,
            ({ option }) => ({
                data: isNil(option)
                    ? undefined
                    : instrumentCollateralizingTypeToDisplayType(option.collateralizingType),
                kind: EDataKind.String,
            }),
        ),
        getInstrumentsRow(
            EPropertyGroup.Option,
            InstrumentPropertyName.OptionType,
            packedFullInstruments,
            ({ option }) => ({
                data: isNil(option)
                    ? undefined
                    : instrumentOptionTypeToDisplayType(option.optionType),
                kind: EDataKind.String,
            }),
        ),
        getInstrumentsRow(
            EPropertyGroup.Option,
            InstrumentPropertyName.OptionStyle,
            packedFullInstruments,
            ({ option }) => ({
                data:
                    isNil(option) || isNil(option.optionStyle.value?.type)
                        ? undefined
                        : instrumentOptionStyleToDisplayStyle(option.optionStyle.value.type),
                kind: EDataKind.String,
            }),
        ),
        getInstrumentsRow(
            EPropertyGroup.Option,
            InstrumentPropertyName.OptionStrikePrice,
            packedFullInstruments,
            ({ option }) => ({
                data: option?.strikePrice,
                kind: EDataKind.Number,
            }),
        ),
    ];
}

function getInstrumentSwapRows(packedFullInstruments: TPackedFullInstrument[]): TPropertyRow[] {
    if (packedFullInstruments.every(({ instrumentSwap }) => isNil(instrumentSwap))) {
        return EMPTY_ARRAY;
    }

    return [
        getInstrumentsRow(
            EPropertyGroup.InstrumentSwap,
            InstrumentPropertyName.InstrumentSwapBuyInstrumentId,
            packedFullInstruments,
            ({ instrumentSwap }) => ({
                data: instrumentSwap?.buyInstrumentId,
                kind: EDataKind.Number,
            }),
        ),
        getInstrumentsRow(
            EPropertyGroup.InstrumentSwap,
            InstrumentPropertyName.InstrumentSwapSellInstrumentId,
            packedFullInstruments,
            ({ instrumentSwap }) => ({
                data: instrumentSwap?.sellInstrumentId,
                kind: EDataKind.Number,
            }),
        ),
    ];
}

function getRevisionRows(packedFullInstruments: TPackedFullInstrument[]): TPropertyRow[] {
    return [
        getInstrumentsRow(
            EPropertyGroup.Revision,
            InstrumentPropertyName.RevisionUser,
            packedFullInstruments,
            ({ user }) => ({
                data: user,
                kind: EDataKind.String,
            }),
        ),
        getInstrumentsRow(
            EPropertyGroup.Revision,
            InstrumentPropertyName.RevisionDate,
            packedFullInstruments,
            ({ instrument }) => ({
                data: { date: instrument.platformTime as ISO, instrument },
                kind: EDataKind.RevisionDateTime,
            }),
        ),
    ];
}
