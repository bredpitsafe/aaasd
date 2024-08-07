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
    TInstrumentWithRevisions,
    TPackedInstrument,
    TRevisionPropertyRow,
} from '../../defs.ts';
import { EDataKind, EPropertyGroup, InstrumentPropertyName } from '../../defs.ts';
import { getInstrumentsRow, packInstrument } from '../utils.ts';

export function useTransposeInstruments(
    instrumentsDesc: TValueDescriptor2<
        ReadonlyMap<number, { instrument: TInstrument; platformTime?: ISO }[]>
    >,
    revisionInstrumentsIds: TInstrumentWithRevisions[],
): TRevisionPropertyRow[] | undefined {
    return useMemo(
        () =>
            matchValueDescriptor(instrumentsDesc, {
                unsynced(vd) {
                    return isFailValueDescriptor(vd) ? EMPTY_ARRAY : undefined;
                },
                synced({ value }): TRevisionPropertyRow[] {
                    const packedInstruments: TPackedInstrument[] = [];

                    for (const instruments of value.values()) {
                        instruments.forEach(({ instrument, platformTime }) =>
                            packedInstruments.push(packInstrument(instrument, isNil(platformTime))),
                        );
                    }

                    return [
                        ...getBasePropertiesRows(packedInstruments, revisionInstrumentsIds),
                        ...getAmountNotationRows(packedInstruments, revisionInstrumentsIds),
                        ...getPriceNotationRows(packedInstruments, revisionInstrumentsIds),
                        ...getSettlementRows(packedInstruments, revisionInstrumentsIds),
                        ...getNotionalRows(packedInstruments, revisionInstrumentsIds),
                        ...getUnderlyingRows(packedInstruments, revisionInstrumentsIds),
                        ...getSpotRows(packedInstruments, revisionInstrumentsIds),
                        ...getStartExpirationRows(packedInstruments, revisionInstrumentsIds),
                        ...getPayoutNotationRows(packedInstruments, revisionInstrumentsIds),
                        ...getMarginNotationRows(packedInstruments, revisionInstrumentsIds),
                        ...getOptionRows(packedInstruments, revisionInstrumentsIds),
                        ...getInstrumentSwapRows(packedInstruments, revisionInstrumentsIds),
                        ...getRevisionRows(packedInstruments, revisionInstrumentsIds),
                    ];
                },
            }),
        [instrumentsDesc, revisionInstrumentsIds],
    );
}

function getBasePropertiesRows(
    packedInstruments: TPackedInstrument[],
    revisionInstrumentsIds: TInstrumentWithRevisions[],
) {
    return [
        getInstrumentsRow(
            EPropertyGroup.BaseProperties,
            InstrumentPropertyName.BasePropertiesId,
            packedInstruments,
            ({ id }) => ({
                data: id,
                kind: EDataKind.Number,
            }),
            revisionInstrumentsIds,
        ),
        getInstrumentsRow(
            EPropertyGroup.BaseProperties,
            InstrumentPropertyName.BasePropertiesName,
            packedInstruments,
            ({ name }) => ({
                data: name,
                kind: EDataKind.String,
            }),
            revisionInstrumentsIds,
        ),
        getInstrumentsRow(
            EPropertyGroup.BaseProperties,
            InstrumentPropertyName.BasePropertiesKind,
            packedInstruments,
            ({ kind }) => ({
                data: isNil(kind) ? undefined : kindToDisplayKind(kind),
                kind: EDataKind.String,
            }),
            revisionInstrumentsIds,
        ),
        getInstrumentsRow(
            EPropertyGroup.BaseProperties,
            InstrumentPropertyName.BasePropertiesApprovalStatus,
            packedInstruments,
            ({ instrument }) => ({ data: instrument, kind: EDataKind.InstrumentApprovalStatus }),
            revisionInstrumentsIds,
        ),
        getInstrumentsRow(
            EPropertyGroup.BaseProperties,
            InstrumentPropertyName.BasePropertiesExchange,
            packedInstruments,
            ({ exchange }) => ({
                data: exchange,
                kind: EDataKind.String,
            }),
            revisionInstrumentsIds,
        ),
    ];
}

function getAmountNotationRows(
    packedInstruments: TPackedInstrument[],
    revisionInstrumentsIds: TInstrumentWithRevisions[],
) {
    return [
        getInstrumentsRow(
            EPropertyGroup.AmountNotation,
            InstrumentPropertyName.AmountNotationAssetId,
            packedInstruments,
            ({ amountNotation }) => ({
                data:
                    amountNotation?.value?.type === 'asset'
                        ? amountNotation?.value.asset.assetId
                        : undefined,
                kind: EDataKind.Number,
            }),
            revisionInstrumentsIds,
        ),
        getInstrumentsRow(
            EPropertyGroup.AmountNotation,
            InstrumentPropertyName.AmountNotationAssetMultiplier,
            packedInstruments,
            ({ amountNotation }) => ({
                data:
                    amountNotation?.value?.type === 'asset'
                        ? amountNotation?.value.asset.multiplier
                        : undefined,
                kind: EDataKind.Number,
            }),
            revisionInstrumentsIds,
        ),
        getInstrumentsRow(
            EPropertyGroup.AmountNotation,
            InstrumentPropertyName.AmountNotationInstrumentId,
            packedInstruments,
            ({ amountNotation }) => ({
                data:
                    amountNotation?.value?.type === 'instrument'
                        ? amountNotation?.value.instrument.instrumentId
                        : undefined,
                kind: EDataKind.Number,
            }),
            revisionInstrumentsIds,
        ),
        getInstrumentsRow(
            EPropertyGroup.AmountNotation,
            InstrumentPropertyName.AmountNotationInstrumentMultiplier,
            packedInstruments,
            ({ amountNotation }) => ({
                data:
                    amountNotation?.value?.type === 'instrument'
                        ? amountNotation?.value.instrument.multiplier
                        : undefined,
                kind: EDataKind.Number,
            }),
            revisionInstrumentsIds,
        ),
        getInstrumentsRow(
            EPropertyGroup.AmountNotation,
            InstrumentPropertyName.AmountNotationIndexId,
            packedInstruments,
            ({ amountNotation }) => ({
                data:
                    amountNotation?.value?.type === 'index'
                        ? amountNotation?.value.index.indexId
                        : undefined,
                kind: EDataKind.Number,
            }),
            revisionInstrumentsIds,
        ),
        getInstrumentsRow(
            EPropertyGroup.AmountNotation,
            InstrumentPropertyName.AmountNotationIndexMultiplier,
            packedInstruments,
            ({ amountNotation }) => ({
                data:
                    amountNotation?.value?.type === 'index'
                        ? amountNotation?.value.index.multiplier
                        : undefined,
                kind: EDataKind.Number,
            }),
            revisionInstrumentsIds,
        ),
    ];
}

function getPriceNotationRows(
    packedInstruments: TPackedInstrument[],
    revisionInstrumentsIds: TInstrumentWithRevisions[],
) {
    return [
        getInstrumentsRow(
            EPropertyGroup.PriceNotation,
            InstrumentPropertyName.PriceNotationNumeratorAssetId,
            packedInstruments,
            ({ priceNotation }) => ({
                data:
                    priceNotation?.value?.ratio.numerator.value?.type === 'assetId'
                        ? priceNotation.value.ratio.numerator.value.assetId
                        : undefined,
                kind: EDataKind.Number,
            }),
            revisionInstrumentsIds,
        ),
        getInstrumentsRow(
            EPropertyGroup.PriceNotation,
            InstrumentPropertyName.PriceNotationNumeratorInstrumentId,
            packedInstruments,
            ({ priceNotation }) => ({
                data:
                    priceNotation?.value?.ratio.numerator.value?.type === 'instrumentId'
                        ? priceNotation.value.ratio.numerator.value.instrumentId
                        : undefined,
                kind: EDataKind.Number,
            }),
            revisionInstrumentsIds,
        ),
        getInstrumentsRow(
            EPropertyGroup.PriceNotation,
            InstrumentPropertyName.PriceNotationNumeratorIndexId,
            packedInstruments,
            ({ priceNotation }) => ({
                data:
                    priceNotation?.value?.ratio?.numerator.value?.type === 'indexId'
                        ? priceNotation.value.ratio.numerator.value.indexId
                        : undefined,
                kind: EDataKind.Number,
            }),
            revisionInstrumentsIds,
        ),
        getInstrumentsRow(
            EPropertyGroup.PriceNotation,
            InstrumentPropertyName.PriceNotationDenominatorAssetId,
            packedInstruments,
            ({ priceNotation }) => ({
                data:
                    priceNotation?.value?.ratio.denominator.value?.type === 'assetId'
                        ? priceNotation.value.ratio.denominator.value.assetId
                        : undefined,
                kind: EDataKind.Number,
            }),
            revisionInstrumentsIds,
        ),
        getInstrumentsRow(
            EPropertyGroup.PriceNotation,
            InstrumentPropertyName.PriceNotationDenominatorInstrumentId,
            packedInstruments,
            ({ priceNotation }) => ({
                data:
                    priceNotation?.value?.ratio.denominator.value?.type === 'instrumentId'
                        ? priceNotation.value.ratio.denominator.value.instrumentId
                        : undefined,
                kind: EDataKind.Number,
            }),
            revisionInstrumentsIds,
        ),
        getInstrumentsRow(
            EPropertyGroup.PriceNotation,
            InstrumentPropertyName.PriceNotationDenominatorIndexId,
            packedInstruments,
            ({ priceNotation }) => ({
                data:
                    priceNotation?.value?.ratio.denominator.value?.type === 'indexId'
                        ? priceNotation.value.ratio.denominator.value.indexId
                        : undefined,
                kind: EDataKind.Number,
            }),
            revisionInstrumentsIds,
        ),
        getInstrumentsRow(
            EPropertyGroup.PriceNotation,
            InstrumentPropertyName.PriceNotationDenominatorMultiplier,
            packedInstruments,
            ({ priceNotation }) => ({
                data: priceNotation?.value?.ratio.denominatorMultiplier,
                kind: EDataKind.Number,
            }),
            revisionInstrumentsIds,
        ),
    ];
}

function getSettlementRows(
    packedInstruments: TPackedInstrument[],
    revisionInstrumentsIds: TInstrumentWithRevisions[],
) {
    return [
        getInstrumentsRow(
            EPropertyGroup.Settlement,
            InstrumentPropertyName.SettlementType,
            packedInstruments,
            ({ settlement }) => ({
                data: isNil(settlement?.type?.type)
                    ? undefined
                    : settlementTypeToDisplaySettlementType(settlement.type.type),
                kind: EDataKind.String,
            }),
            revisionInstrumentsIds,
        ),
        getInstrumentsRow(
            EPropertyGroup.Settlement,
            InstrumentPropertyName.SettlementTime,
            packedInstruments,
            ({ settlement }) => ({
                data: settlement?.time,
                kind: EDataKind.DateTime,
            }),
            revisionInstrumentsIds,
        ),
        getInstrumentsRow(
            EPropertyGroup.Settlement,
            InstrumentPropertyName.SettlementAssetId,
            packedInstruments,
            ({ settlement }) => ({
                data:
                    settlement?.type?.type === 'financiallySettled'
                        ? settlement.type.financiallySettled.assetId
                        : settlement?.type?.type === 'physicallyDelivered'
                          ? settlement.type.physicallyDelivered.assetId
                          : undefined,
                kind: EDataKind.Number,
            }),
            revisionInstrumentsIds,
        ),
        getInstrumentsRow(
            EPropertyGroup.Settlement,
            InstrumentPropertyName.SettlementAssetsPerContract,
            packedInstruments,
            ({ settlement }) => ({
                data:
                    settlement?.type?.type === 'physicallyDelivered'
                        ? settlement.type.physicallyDelivered.assetsPerContract
                        : undefined,
                kind: EDataKind.Number,
            }),
            revisionInstrumentsIds,
        ),
        getInstrumentsRow(
            EPropertyGroup.Settlement,
            InstrumentPropertyName.SettlementInstrumentId,
            packedInstruments,
            ({ settlement }) => ({
                data:
                    settlement?.type?.type === 'exercisesIntoInstrument'
                        ? settlement.type.exercisesIntoInstrument.instrumentId
                        : undefined,
                kind: EDataKind.Number,
            }),
            revisionInstrumentsIds,
        ),
        getInstrumentsRow(
            EPropertyGroup.Settlement,
            InstrumentPropertyName.SettlementInstrumentsPerContract,
            packedInstruments,
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

function getNotionalRows(
    packedInstruments: TPackedInstrument[],
    revisionInstrumentsIds: TInstrumentWithRevisions[],
) {
    return [
        getInstrumentsRow(
            EPropertyGroup.Notional,
            InstrumentPropertyName.NotionalKind,
            packedInstruments,
            ({ notional }) => ({
                data: isNil(notional?.type)
                    ? undefined
                    : instrumentNotionalTypeToDisplayType(notional.type),
                kind: EDataKind.String,
            }),
            revisionInstrumentsIds,
        ),
        getInstrumentsRow(
            EPropertyGroup.Notional,
            InstrumentPropertyName.NotionalAssetId,
            packedInstruments,
            ({ notional }) => ({
                data: notional?.type === 'asset' ? notional.asset.assetId : undefined,
                kind: EDataKind.Number,
            }),
            revisionInstrumentsIds,
        ),
        getInstrumentsRow(
            EPropertyGroup.Notional,
            InstrumentPropertyName.NotionalAssetsPerContract,
            packedInstruments,
            ({ notional }) => ({
                data: notional?.type === 'asset' ? notional.asset.assetsPerContract : undefined,
                kind: EDataKind.Number,
            }),
            revisionInstrumentsIds,
        ),
        getInstrumentsRow(
            EPropertyGroup.Notional,
            InstrumentPropertyName.NotionalInstrumentId,
            packedInstruments,
            ({ notional }) => ({
                data:
                    notional?.type === 'instrument' ? notional.instrument.instrumentId : undefined,
                kind: EDataKind.Number,
            }),
            revisionInstrumentsIds,
        ),
        getInstrumentsRow(
            EPropertyGroup.Notional,
            InstrumentPropertyName.NotionalInstrumentsPerContract,
            packedInstruments,
            ({ notional }) => ({
                data:
                    notional?.type === 'instrument'
                        ? notional.instrument.instrumentsPerContract
                        : undefined,
                kind: EDataKind.Number,
            }),
            revisionInstrumentsIds,
        ),
        getInstrumentsRow(
            EPropertyGroup.Notional,
            InstrumentPropertyName.NotionalFactor,
            packedInstruments,
            ({ notional }) => ({
                data:
                    notional?.type === 'priceProportional'
                        ? notional.priceProportional.factor
                        : undefined,
                kind: EDataKind.Number,
            }),
            revisionInstrumentsIds,
        ),
        getInstrumentsRow(
            EPropertyGroup.Notional,
            InstrumentPropertyName.NotionalNotationAssetId,
            packedInstruments,
            ({ notional }) => ({
                data:
                    notional?.type === 'priceProportional'
                        ? notional.priceProportional.notationAssetId
                        : undefined,
                kind: EDataKind.Number,
            }),
            revisionInstrumentsIds,
        ),
        getInstrumentsRow(
            EPropertyGroup.Notional,
            InstrumentPropertyName.NotionalPriceSourceInstrumentId,
            packedInstruments,
            ({ notional }) => ({
                data:
                    notional?.type === 'priceProportional' &&
                    notional.priceProportional.priceSource.value?.type === 'instrumentId'
                        ? notional.priceProportional.priceSource.value.instrumentId
                        : undefined,
                kind: EDataKind.Number,
            }),
            revisionInstrumentsIds,
        ),
        getInstrumentsRow(
            EPropertyGroup.Notional,
            InstrumentPropertyName.NotionalPriceSourceIndexId,
            packedInstruments,
            ({ notional }) => ({
                data:
                    notional?.type === 'priceProportional' &&
                    notional.priceProportional.priceSource.value?.type === 'indexId'
                        ? notional.priceProportional.priceSource.value.indexId
                        : undefined,
                kind: EDataKind.Number,
            }),
            revisionInstrumentsIds,
        ),
    ];
}

function getUnderlyingRows(
    packedInstruments: TPackedInstrument[],
    revisionInstrumentsIds: TInstrumentWithRevisions[],
) {
    return [
        getInstrumentsRow(
            EPropertyGroup.Underlying,
            InstrumentPropertyName.UnderlyingAssetId,
            packedInstruments,
            ({ underlying }) => ({
                data: underlying?.type === 'assetId' ? underlying.assetId : undefined,
                kind: EDataKind.Number,
            }),
            revisionInstrumentsIds,
        ),
        getInstrumentsRow(
            EPropertyGroup.Underlying,
            InstrumentPropertyName.UnderlyingInstrumentId,
            packedInstruments,
            ({ underlying }) => ({
                data: underlying?.type === 'instrumentId' ? underlying.instrumentId : undefined,
                kind: EDataKind.Number,
            }),
            revisionInstrumentsIds,
        ),
        getInstrumentsRow(
            EPropertyGroup.Underlying,
            InstrumentPropertyName.UnderlyingIndexId,
            packedInstruments,
            ({ underlying }) => ({
                data: underlying?.type === 'indexId' ? underlying.indexId : undefined,
                kind: EDataKind.Number,
            }),
            revisionInstrumentsIds,
        ),
    ];
}

function getSpotRows(
    packedInstruments: TPackedInstrument[],
    revisionInstrumentsIds: TInstrumentWithRevisions[],
) {
    return [
        getInstrumentsRow(
            EPropertyGroup.Spot,
            InstrumentPropertyName.SpotBaseAssetId,
            packedInstruments,
            ({ baseAssetId }) => ({
                data: baseAssetId,
                kind: EDataKind.Number,
            }),
            revisionInstrumentsIds,
        ),
        getInstrumentsRow(
            EPropertyGroup.Spot,
            InstrumentPropertyName.SpotQuoteAssetId,
            packedInstruments,
            ({ quoteAssetId }) => ({
                data: quoteAssetId,
                kind: EDataKind.Number,
            }),
            revisionInstrumentsIds,
        ),
    ];
}

function getStartExpirationRows(
    packedInstruments: TPackedInstrument[],
    revisionInstrumentsIds: TInstrumentWithRevisions[],
) {
    return [
        getInstrumentsRow(
            EPropertyGroup.StartExpiration,
            InstrumentPropertyName.StartExpirationStartTime,
            packedInstruments,
            ({ startTime }) => ({
                data: startTime as ISO,
                kind: EDataKind.DateTime,
            }),
            revisionInstrumentsIds,
        ),
        getInstrumentsRow(
            EPropertyGroup.StartExpiration,
            InstrumentPropertyName.StartExpirationExpirationTime,
            packedInstruments,
            ({ expirationTime }) => ({
                data: expirationTime as ISO,
                kind: EDataKind.DateTime,
            }),
            revisionInstrumentsIds,
        ),
    ];
}

function getPayoutNotationRows(
    packedInstruments: TPackedInstrument[],
    revisionInstrumentsIds: TInstrumentWithRevisions[],
) {
    return [
        getInstrumentsRow(
            EPropertyGroup.PayoutNotation,
            InstrumentPropertyName.PayoutNotationUnitAssetId,
            packedInstruments,
            ({ payoutNotation }) => ({
                data:
                    payoutNotation?.payoutUnit.value?.type === 'assetId'
                        ? payoutNotation.payoutUnit.value.assetId
                        : undefined,
                kind: EDataKind.Number,
            }),
            revisionInstrumentsIds,
        ),
        getInstrumentsRow(
            EPropertyGroup.PayoutNotation,
            InstrumentPropertyName.PayoutNotationFunction,
            packedInstruments,
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

function getMarginNotationRows(
    packedInstruments: TPackedInstrument[],
    revisionInstrumentsIds: TInstrumentWithRevisions[],
) {
    return [
        getInstrumentsRow(
            EPropertyGroup.MarginNotation,
            InstrumentPropertyName.MarginNotationAssetId,
            packedInstruments,
            ({ marginNotation }) => ({
                data:
                    isNil(marginNotation) || marginNotation.type !== 'assetId'
                        ? undefined
                        : marginNotation.assetId,
                kind: EDataKind.Number,
            }),
            revisionInstrumentsIds,
        ),
    ];
}

function getOptionRows(
    packedInstruments: TPackedInstrument[],
    revisionInstrumentsIds: TInstrumentWithRevisions[],
) {
    return [
        getInstrumentsRow(
            EPropertyGroup.Option,
            InstrumentPropertyName.OptionCollateralizingType,
            packedInstruments,
            ({ option }) => ({
                data: isNil(option)
                    ? undefined
                    : instrumentCollateralizingTypeToDisplayType(option.collateralizingType),
                kind: EDataKind.String,
            }),
            revisionInstrumentsIds,
        ),
        getInstrumentsRow(
            EPropertyGroup.Option,
            InstrumentPropertyName.OptionType,
            packedInstruments,
            ({ option }) => ({
                data: isNil(option)
                    ? undefined
                    : instrumentOptionTypeToDisplayType(option.optionType),
                kind: EDataKind.String,
            }),
            revisionInstrumentsIds,
        ),
        getInstrumentsRow(
            EPropertyGroup.Option,
            InstrumentPropertyName.OptionStyle,
            packedInstruments,
            ({ option }) => ({
                data:
                    isNil(option) || isNil(option.optionStyle.value?.type)
                        ? undefined
                        : instrumentOptionStyleToDisplayStyle(option.optionStyle.value.type),
                kind: EDataKind.String,
            }),
            revisionInstrumentsIds,
        ),
        getInstrumentsRow(
            EPropertyGroup.Option,
            InstrumentPropertyName.OptionStrikePrice,
            packedInstruments,
            ({ option }) => ({
                data: option?.strikePrice,
                kind: EDataKind.Number,
            }),
            revisionInstrumentsIds,
        ),
    ];
}

function getInstrumentSwapRows(
    packedInstruments: TPackedInstrument[],
    revisionInstrumentsIds: TInstrumentWithRevisions[],
) {
    return [
        getInstrumentsRow(
            EPropertyGroup.InstrumentSwap,
            InstrumentPropertyName.InstrumentSwapBuyInstrumentId,
            packedInstruments,
            ({ instrumentSwap }) => ({
                data: instrumentSwap?.buyInstrumentId,
                kind: EDataKind.Number,
            }),
            revisionInstrumentsIds,
        ),
        getInstrumentsRow(
            EPropertyGroup.InstrumentSwap,
            InstrumentPropertyName.InstrumentSwapSellInstrumentId,
            packedInstruments,
            ({ instrumentSwap }) => ({
                data: instrumentSwap?.sellInstrumentId,
                kind: EDataKind.Number,
            }),
            revisionInstrumentsIds,
        ),
    ];
}

function getRevisionRows(
    packedInstruments: TPackedInstrument[],
    revisionInstrumentsIds: TInstrumentWithRevisions[],
) {
    return [
        getInstrumentsRow(
            EPropertyGroup.Revision,
            InstrumentPropertyName.RevisionUser,
            packedInstruments,
            ({ user }) => ({
                data: user,
                kind: EDataKind.String,
            }),
            revisionInstrumentsIds,
        ),
        getInstrumentsRow(
            EPropertyGroup.Revision,
            InstrumentPropertyName.RevisionDate,
            packedInstruments,
            ({ platformTime }) => ({
                data: platformTime as ISO,
                kind: EDataKind.DateTime,
            }),
            revisionInstrumentsIds,
        ),
    ];
}
