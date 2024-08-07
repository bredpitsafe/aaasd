import { blue, grey } from '@ant-design/colors';
import type {
    TInstrument,
    TProviderInstrumentDetails,
    TProviderInstrumentDetailsFuturesPayoutNotation,
    TProviderInstrumentDetailsFuturesPayoutNotationFuturesPayoutUnit,
    TProviderInstrumentDetailsMarginNotation,
    TProviderInstrumentDetailsNotional,
    TProviderInstrumentDetailsNotionalPriceProportionalPriceSource,
    TProviderInstrumentDetailsPriceNotationRatioPriceNotationUnit,
    TProviderInstrumentDetailsSettlementType,
    TProviderInstrumentDetailsUnderlying,
} from '@backend/bff/src/modules/instruments/schemas/defs';
import type { ISO, TimeZone } from '@common/types';
import { EDateTimeFormats } from '@common/types';
import { generateTraceId, toDayjsWithTimezone } from '@common/utils';
import { assertNever } from '@common/utils/src/assert.ts';
import { Descriptions } from '@frontend/common/src/components/Descriptions';
import { Tag } from '@frontend/common/src/components/Tag';
import { useModule } from '@frontend/common/src/di/react.tsx';
import { ModuleModals } from '@frontend/common/src/lib/modals.tsx';
import { ModuleUpdateProviderInstrumentsOverrideOnCurrentStage } from '@frontend/common/src/modules/instruments/ModuleUpdateProviderInstrumentsOverrideOnCurrentStage.ts';
import {
    instrumentCollateralizingTypeToDisplayType,
    instrumentNotionalTypeToDisplayType,
    instrumentOptionStyleToDisplayStyle,
    instrumentOptionTypeToDisplayType,
    instrumentPayoutFunctionToDisplayPayoutFunction,
    kindToDisplayKind,
    settlementTypeToDisplaySettlementType,
} from '@frontend/common/src/utils/instruments/converters.ts';
import { getProviderInstrumentMarginNotation } from '@frontend/common/src/utils/instruments/getInstrumentMarginNotation.ts';
import { getProviderInstrumentNotional } from '@frontend/common/src/utils/instruments/getInstrumentNotional.ts';
import { getProviderInstrumentPayoutNotation } from '@frontend/common/src/utils/instruments/getInstrumentPayoutNotation.ts';
import { getProviderInstrumentSettlementTime } from '@frontend/common/src/utils/instruments/getinstrumentSettlementTime.ts';
import { getProviderInstrumentSettlementType } from '@frontend/common/src/utils/instruments/getInstrumentSettlementType.ts';
import { getProviderInstrumentSpotData } from '@frontend/common/src/utils/instruments/getInstrumentSpotData.ts';
import { getProviderInstrumentStartExpiration } from '@frontend/common/src/utils/instruments/getInstrumentStartExpiration.ts';
import { getProviderInstrumentUnderlying } from '@frontend/common/src/utils/instruments/getInstrumentUnderlying.ts';
import { useFunction } from '@frontend/common/src/utils/React/useFunction.ts';
import { useNotifiedObservableFunction } from '@frontend/common/src/utils/React/useObservableFunction.ts';
import { createSyncedValueDescriptor } from '@frontend/common/src/utils/ValueDescriptor/utils.ts';
import { isEmpty, isNil } from 'lodash-es';
import type { ReactNode } from 'react';
import { memo, useMemo } from 'react';
import { of } from 'rxjs';

import { EPropertyGroup, ProviderInstrumentPropertyName } from '../../components/Tables/defs.ts';

export function useUpdateProviderInstrumentsOverride(): (
    instruments: TInstrument[],
    providerInstrumentDetails: TProviderInstrumentDetails | undefined,
    timeZone: TimeZone,
) => Promise<boolean> {
    const updateProviderInstrumentsOverride = useModule(
        ModuleUpdateProviderInstrumentsOverrideOnCurrentStage,
    );

    const { confirm } = useModule(ModuleModals);

    const [updateOverride] = useNotifiedObservableFunction(
        (
            instruments: TInstrument[],
            providerInstrumentDetails: TProviderInstrumentDetails | undefined,
        ) =>
            instruments.length === 0
                ? of(createSyncedValueDescriptor(true))
                : updateProviderInstrumentsOverride(
                      {
                          instrumentIds: instruments.map(({ id }) => id),
                          providerInstrumentDetails: providerInstrumentDetails,
                      },
                      { traceId: generateTraceId() },
                  ),
        {
            mapError: () => ({
                message: 'Failed to update Provider Instruments Override instruments',
            }),
            getNotifyTitle: () => ({
                loading: 'Updating Provider Instruments Override',
                success: 'Successfully updated Provider Instruments Override',
            }),
        },
    );

    return useFunction(
        async (
            instruments: TInstrument[],
            providerInstrumentDetails: TProviderInstrumentDetails | undefined,
            timeZone: TimeZone,
        ): Promise<boolean> => {
            if (
                instruments.length === 0 ||
                isNil(providerInstrumentDetails) ||
                isEmpty(providerInstrumentDetails)
            ) {
                return false;
            }

            const approved = await confirm('', {
                title: `Update Provider Instruments Override for ${
                    instruments.length > 1
                        ? `${instruments.length} instruments`
                        : `"${instruments[0].name}"`
                }?`,
                width: '650px',
                content: (
                    <ProviderInstrumentDetailRenderer
                        providerInstrumentDetails={providerInstrumentDetails}
                        timeZone={timeZone}
                    />
                ),
            });

            if (!approved) {
                return false;
            }

            return updateOverride(instruments, providerInstrumentDetails);
        },
    );
}

const ProviderInstrumentDetailRenderer = memo(
    ({
        providerInstrumentDetails,
        timeZone,
    }: {
        providerInstrumentDetails: TProviderInstrumentDetails;
        timeZone: TimeZone;
    }) => {
        const amountNotationDetails = useMemo(
            () => getAmountNotationDescriptions(providerInstrumentDetails),
            [providerInstrumentDetails],
        );

        const priceNotationDetails = useMemo(
            () => getPriceNotationDescriptions(providerInstrumentDetails),
            [providerInstrumentDetails],
        );

        const kindDetails = useMemo(() => {
            const kind = providerInstrumentDetails.kind?.type;

            return isNil(kind)
                ? null
                : getDescriptionsItem('Base Properties', 'Kind', blue[3], kindToDisplayKind(kind));
        }, [providerInstrumentDetails]);

        const settlementDetails = useMemo(() => {
            const settlementType = getProviderInstrumentSettlementType(providerInstrumentDetails);
            const settlementTime = getProviderInstrumentSettlementTime(providerInstrumentDetails);

            return isNil(settlementType) && isNil(settlementTime)
                ? null
                : getSettlementDescriptions(settlementType, settlementTime, timeZone);
        }, [providerInstrumentDetails, timeZone]);

        const notionalDetails = useMemo(() => {
            const notional = getProviderInstrumentNotional(providerInstrumentDetails);

            return isNil(notional) ? null : getNotionalDescriptions(notional);
        }, [providerInstrumentDetails]);

        const underlyingDetails = useMemo(() => {
            const underlying = getProviderInstrumentUnderlying(providerInstrumentDetails);

            return isNil(underlying) ? null : getUnderlyingDescriptions(underlying);
        }, [providerInstrumentDetails]);

        const spotDetails = useMemo(() => {
            const spot = getProviderInstrumentSpotData(providerInstrumentDetails);

            return isNil(spot) ? null : getSpotDescriptions(spot);
        }, [providerInstrumentDetails]);

        const startExpirationDetails = useMemo(() => {
            const startExpiration = getProviderInstrumentStartExpiration(providerInstrumentDetails);

            return isNil(startExpiration)
                ? null
                : getStartExpirationDescriptions(startExpiration, timeZone);
        }, [providerInstrumentDetails, timeZone]);

        const payoutNotationDetails = useMemo(() => {
            const payoutNotation = getProviderInstrumentPayoutNotation(providerInstrumentDetails);

            return isNil(payoutNotation) ? null : getPayoutNotationDescriptions(payoutNotation);
        }, [providerInstrumentDetails]);

        const marginNotationDetails = useMemo(() => {
            const marginNotation = getProviderInstrumentMarginNotation(providerInstrumentDetails);

            return isNil(marginNotation) ? null : getMarginNotationDescriptions(marginNotation);
        }, [providerInstrumentDetails]);

        const optionDetails = useMemo(
            () => getOptionDescriptions(providerInstrumentDetails),
            [providerInstrumentDetails],
        );

        const instrumentSwapDetails = useMemo(
            () => getInstrumentSwapDescriptions(providerInstrumentDetails),
            [providerInstrumentDetails],
        );

        return (
            <Descriptions bordered layout="horizontal" column={1} size="small">
                {kindDetails}
                {amountNotationDetails}
                {priceNotationDetails}
                {settlementDetails}
                {notionalDetails}
                {underlyingDetails}
                {spotDetails}
                {startExpirationDetails}
                {payoutNotationDetails}
                {marginNotationDetails}
                {optionDetails}
                {instrumentSwapDetails}
            </Descriptions>
        );
    },
);

function getDescriptionsItem(group: string, label: string, color: string, value: ReactNode) {
    return isNil(value) ? null : (
        <Descriptions.Item
            label={
                <>
                    <Tag color={color}>{group}</Tag>&nbsp;
                    <span>{label}</span>
                </>
            }
        >
            {value}
        </Descriptions.Item>
    );
}

function getAmountNotationDescriptions(
    providerInstrumentDetails: TProviderInstrumentDetails,
    color = grey[3],
) {
    const { amountNotation } = providerInstrumentDetails;

    if (isNil(amountNotation) || isNil(amountNotation.value)) {
        return null;
    }

    const { type } = amountNotation.value;
    switch (type) {
        case 'asset':
            return (
                <>
                    {getDescriptionsItem(
                        EPropertyGroup.AmountNotation,
                        ProviderInstrumentPropertyName.AmountNotationAssetName,
                        color,
                        amountNotation.value.asset.assetName,
                    )}
                    {getDescriptionsItem(
                        EPropertyGroup.AmountNotation,
                        ProviderInstrumentPropertyName.AmountNotationAssetMultiplier,
                        color,
                        amountNotation.value.asset.multiplier,
                    )}
                </>
            );
        case 'instrument':
            return (
                <>
                    {getDescriptionsItem(
                        EPropertyGroup.AmountNotation,
                        ProviderInstrumentPropertyName.AmountNotationInstrumentName,
                        color,
                        amountNotation.value.instrument.instrumentName,
                    )}
                    {getDescriptionsItem(
                        EPropertyGroup.AmountNotation,
                        ProviderInstrumentPropertyName.AmountNotationInstrumentMultiplier,
                        color,
                        amountNotation.value.instrument.multiplier,
                    )}
                </>
            );
        case 'index':
            return (
                <>
                    {getDescriptionsItem(
                        EPropertyGroup.AmountNotation,
                        ProviderInstrumentPropertyName.AmountNotationIndexName,
                        color,
                        amountNotation.value.index.indexName,
                    )}
                    {getDescriptionsItem(
                        EPropertyGroup.AmountNotation,
                        ProviderInstrumentPropertyName.AmountNotationIndexMultiplier,
                        color,
                        amountNotation.value.index.multiplier,
                    )}
                </>
            );
        default:
            assertNever(type);
    }
}

function getPriceNotationDescriptions(
    providerInstrumentDetails: TProviderInstrumentDetails,
    color = grey[3],
) {
    const { priceNotation } = providerInstrumentDetails;

    if (isNil(priceNotation) || isNil(priceNotation.value)) {
        return null;
    }

    const { type } = priceNotation.value;
    switch (type) {
        case 'ratio':
            const ratio = priceNotation.value.ratio;

            return (
                <>
                    {getUnitDescriptions(
                        ratio.numerator,
                        EPropertyGroup.PriceNotation,
                        'Numerator',
                        color,
                    )}
                    {getUnitDescriptions(
                        ratio.denominator,
                        EPropertyGroup.PriceNotation,
                        'Denominator',
                        color,
                    )}
                    {getDescriptionsItem(
                        EPropertyGroup.PriceNotation,
                        ProviderInstrumentPropertyName.PriceNotationDenominatorMultiplier,
                        color,
                        ratio.denominatorMultiplier,
                    )}
                </>
            );
        default:
            assertNever(type);
    }
}

function getUnitDescriptions(
    unit:
        | undefined
        | TProviderInstrumentDetailsPriceNotationRatioPriceNotationUnit
        | TProviderInstrumentDetailsNotionalPriceProportionalPriceSource
        | TProviderInstrumentDetailsUnderlying
        | TProviderInstrumentDetailsFuturesPayoutNotationFuturesPayoutUnit,
    group: string,
    labelPrefix: string | undefined,
    color: string,
) {
    if (isNil(unit?.value)) {
        return null;
    }

    const displayPrefix = isEmpty(labelPrefix) ? '' : `${labelPrefix} `;
    const { type } = unit.value;
    switch (type) {
        case 'assetName':
            return getDescriptionsItem(
                group,
                `${displayPrefix}Asset Name`,
                color,
                unit.value.assetName,
            );
        case 'instrumentName':
            return getDescriptionsItem(
                group,
                `${displayPrefix}Instrument Name`,
                color,
                unit.value.instrumentName,
            );
        case 'indexName':
            return getDescriptionsItem(
                group,
                `${displayPrefix}Index Name`,
                color,
                unit.value.indexName,
            );
        default:
            assertNever(type);
    }
}

function getSettlementDescriptions(
    settlementType:
        | Exclude<TProviderInstrumentDetailsSettlementType['value'], undefined>
        | undefined,
    settlementTime: ISO | undefined,
    timeZone: TimeZone,
    color = grey[3],
) {
    const common = (
        <>
            {getDescriptionsItem(
                EPropertyGroup.Settlement,
                ProviderInstrumentPropertyName.SettlementType,
                color,
                isNil(settlementType?.type)
                    ? null
                    : settlementTypeToDisplaySettlementType(settlementType?.type),
            )}
            {getDescriptionsItem(
                EPropertyGroup.Settlement,
                ProviderInstrumentPropertyName.SettlementTime,
                color,
                isNil(settlementTime)
                    ? null
                    : toDayjsWithTimezone(settlementTime, timeZone).format(
                          EDateTimeFormats.DateTime,
                      ),
            )}
        </>
    );

    if (isNil(settlementType?.type)) {
        return common;
    }

    const { type } = settlementType;

    switch (type) {
        case 'financiallySettled':
            return (
                <>
                    {common}
                    {getDescriptionsItem(
                        EPropertyGroup.Settlement,
                        ProviderInstrumentPropertyName.SettlementAssetName,
                        color,
                        settlementType.financiallySettled.assetName,
                    )}
                </>
            );
        case 'physicallyDelivered':
            return (
                <>
                    {common}
                    {getDescriptionsItem(
                        EPropertyGroup.Settlement,
                        ProviderInstrumentPropertyName.SettlementAssetName,
                        color,
                        settlementType.physicallyDelivered.assetName,
                    )}
                    {getDescriptionsItem(
                        EPropertyGroup.Settlement,
                        ProviderInstrumentPropertyName.SettlementAssetsPerContract,
                        color,
                        settlementType.physicallyDelivered.assetsPerContract,
                    )}
                </>
            );
        case 'exercisesIntoInstrument':
            return (
                <>
                    {common}
                    {getDescriptionsItem(
                        EPropertyGroup.Settlement,
                        ProviderInstrumentPropertyName.SettlementInstrumentName,
                        color,
                        settlementType.exercisesIntoInstrument.instrumentName,
                    )}
                    {getDescriptionsItem(
                        EPropertyGroup.Settlement,
                        ProviderInstrumentPropertyName.SettlementInstrumentsPerContract,
                        color,
                        settlementType.exercisesIntoInstrument.instrumentsPerContract,
                    )}
                </>
            );

        default:
            assertNever(type);
    }
}

function getNotionalDescriptions(
    notional: Exclude<TProviderInstrumentDetailsNotional['value'], undefined>,
    color = grey[3],
) {
    const { type } = notional;

    const common = getDescriptionsItem(
        EPropertyGroup.Notional,
        ProviderInstrumentPropertyName.NotionalKind,
        color,
        instrumentNotionalTypeToDisplayType(type),
    );

    switch (type) {
        case 'asset':
            return (
                <>
                    {common}
                    {getDescriptionsItem(
                        EPropertyGroup.Notional,
                        ProviderInstrumentPropertyName.NotionalAssetName,
                        color,
                        notional.asset.assetName,
                    )}
                    {getDescriptionsItem(
                        EPropertyGroup.Notional,
                        ProviderInstrumentPropertyName.NotionalAssetsPerContract,
                        color,
                        notional.asset.assetsPerContract,
                    )}
                </>
            );
        case 'instrument':
            return (
                <>
                    {common}
                    {getDescriptionsItem(
                        EPropertyGroup.Notional,
                        ProviderInstrumentPropertyName.NotionalInstrumentName,
                        color,
                        notional.instrument.instrumentName,
                    )}
                    {getDescriptionsItem(
                        EPropertyGroup.Notional,
                        ProviderInstrumentPropertyName.NotionalInstrumentsPerContract,
                        color,
                        notional.instrument.instrumentsPerContract,
                    )}
                </>
            );
        case 'priceProportional':
            return (
                <>
                    {common}
                    {getDescriptionsItem(
                        EPropertyGroup.Notional,
                        ProviderInstrumentPropertyName.NotionalFactor,
                        color,
                        notional.priceProportional.factor,
                    )}
                    {getDescriptionsItem(
                        EPropertyGroup.Notional,
                        ProviderInstrumentPropertyName.NotionalNotationAssetName,
                        color,
                        notional.priceProportional.notationAssetName,
                    )}
                    {getUnitDescriptions(
                        notional.priceProportional.priceSource,
                        EPropertyGroup.Notional,
                        'Price Source',
                        color,
                    )}
                </>
            );
        default:
            assertNever(type);
    }
}

function getUnderlyingDescriptions(
    underlying: Exclude<TProviderInstrumentDetailsUnderlying['value'], undefined>,
    color = grey[3],
) {
    return getUnitDescriptions(
        { value: underlying },
        EPropertyGroup.Underlying,
        'Price Source',
        color,
    );
}

function getSpotDescriptions(
    {
        baseAssetName,
        quoteAssetName,
    }: { baseAssetName: string | undefined; quoteAssetName: string | undefined },
    color = grey[3],
) {
    return (
        <>
            {getDescriptionsItem(
                EPropertyGroup.Spot,
                ProviderInstrumentPropertyName.SpotBaseAssetName,
                color,
                baseAssetName,
            )}
            {getDescriptionsItem(
                EPropertyGroup.Spot,
                ProviderInstrumentPropertyName.SpotQuoteAssetName,
                color,
                quoteAssetName,
            )}
        </>
    );
}

function getStartExpirationDescriptions(
    { startTime, expirationTime }: { startTime: ISO | undefined; expirationTime: ISO | undefined },
    timeZone: TimeZone,
    color = grey[3],
) {
    return (
        <>
            {getDescriptionsItem(
                EPropertyGroup.StartExpiration,
                ProviderInstrumentPropertyName.StartExpirationStartTime,
                color,
                isNil(startTime)
                    ? null
                    : toDayjsWithTimezone(startTime, timeZone).format(EDateTimeFormats.DateTime),
            )}
            {getDescriptionsItem(
                EPropertyGroup.StartExpiration,
                ProviderInstrumentPropertyName.StartExpirationExpirationTime,
                color,
                isNil(expirationTime)
                    ? null
                    : toDayjsWithTimezone(expirationTime, timeZone).format(
                          EDateTimeFormats.DateTime,
                      ),
            )}
        </>
    );
}

function getPayoutNotationDescriptions(
    payoutNotation: TProviderInstrumentDetailsFuturesPayoutNotation,
    color = grey[3],
) {
    return (
        <>
            {getUnitDescriptions(
                payoutNotation.payoutUnit,
                EPropertyGroup.PayoutNotation,
                'Unit',
                color,
            )}
            {getDescriptionsItem(
                EPropertyGroup.PayoutNotation,
                ProviderInstrumentPropertyName.PayoutNotationFunction,
                color,
                isNil(payoutNotation.payoutFunction)
                    ? undefined
                    : instrumentPayoutFunctionToDisplayPayoutFunction(
                          payoutNotation.payoutFunction,
                      ),
            )}
        </>
    );
}

function getMarginNotationDescriptions(
    marginNotation: Exclude<TProviderInstrumentDetailsMarginNotation['value'], undefined>,
    color = grey[3],
) {
    return getUnitDescriptions(
        { value: marginNotation },
        EPropertyGroup.MarginNotation,
        undefined,
        color,
    );
}

function getOptionDescriptions(
    providerInstrumentDetails: TProviderInstrumentDetails,
    color = grey[3],
) {
    if (providerInstrumentDetails.kind?.type !== 'option') {
        return null;
    }

    const { collateralizingType, optionType, optionStyle, strikePrice } =
        providerInstrumentDetails.kind.option;

    if (
        isNil(collateralizingType) &&
        isNil(optionType) &&
        isNil(optionStyle) &&
        isNil(strikePrice)
    ) {
        return null;
    }

    return (
        <>
            {getDescriptionsItem(
                EPropertyGroup.Option,
                ProviderInstrumentPropertyName.OptionCollateralizingType,
                color,
                isNil(collateralizingType)
                    ? undefined
                    : instrumentCollateralizingTypeToDisplayType(collateralizingType),
            )}
            {getDescriptionsItem(
                EPropertyGroup.Option,
                ProviderInstrumentPropertyName.OptionType,
                color,
                isNil(optionType) ? undefined : instrumentOptionTypeToDisplayType(optionType),
            )}
            {getDescriptionsItem(
                EPropertyGroup.Option,
                ProviderInstrumentPropertyName.OptionStyle,
                color,
                isNil(optionStyle?.value)
                    ? undefined
                    : instrumentOptionStyleToDisplayStyle(optionStyle.value.type),
            )}
            {getDescriptionsItem(
                EPropertyGroup.Option,
                ProviderInstrumentPropertyName.OptionStrikePrice,
                color,
                strikePrice,
            )}
        </>
    );
}

function getInstrumentSwapDescriptions(
    providerInstrumentDetails: TProviderInstrumentDetails,
    color = grey[3],
) {
    if (providerInstrumentDetails.kind?.type !== 'instrumentSwap') {
        return null;
    }

    const { buyInstrumentName, sellInstrumentName } = providerInstrumentDetails.kind.instrumentSwap;

    if (isNil(buyInstrumentName) && isNil(sellInstrumentName)) {
        return null;
    }

    return (
        <>
            {getDescriptionsItem(
                EPropertyGroup.InstrumentSwap,
                ProviderInstrumentPropertyName.InstrumentSwapBuyInstrumentName,
                color,
                buyInstrumentName,
            )}
            {getDescriptionsItem(
                EPropertyGroup.InstrumentSwap,
                ProviderInstrumentPropertyName.InstrumentSwapSellInstrumentName,
                color,
                sellInstrumentName,
            )}
        </>
    );
}
