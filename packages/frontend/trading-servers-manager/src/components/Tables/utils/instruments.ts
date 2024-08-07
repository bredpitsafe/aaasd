import type {
    TInstrument,
    TInstrumentDynamicDataPriceStepRules,
    TInstrumentReductionError,
    TProviderInstrument,
} from '@backend/bff/src/modules/instruments/schemas/defs.ts';
import type { ISO, TimeZone } from '@common/types';
import { EDateTimeFormats } from '@common/types';
import { toDayjsWithTimezone } from '@common/utils';
import { assertNever } from '@common/utils/src/assert.ts';
import type {
    ValueFormatterFunc,
    ValueFormatterParams,
} from '@frontend/ag-grid/src/ag-grid-community.ts';
import {
    dynamicDataStatusToDisplayStatus,
    statusToDisplayStatus,
} from '@frontend/common/src/utils/instruments/converters.ts';
import { getProviderInstrumentMarginNotation } from '@frontend/common/src/utils/instruments/getInstrumentMarginNotation.ts';
import { getProviderInstrumentNotional } from '@frontend/common/src/utils/instruments/getInstrumentNotional.ts';
import { getProviderInstrumentPayoutNotation } from '@frontend/common/src/utils/instruments/getInstrumentPayoutNotation.ts';
import { getProviderInstrumentSettlementTime } from '@frontend/common/src/utils/instruments/getinstrumentSettlementTime.ts';
import { getProviderInstrumentSettlementType } from '@frontend/common/src/utils/instruments/getInstrumentSettlementType.ts';
import { getProviderInstrumentSpotData } from '@frontend/common/src/utils/instruments/getInstrumentSpotData.ts';
import { getProviderInstrumentStartExpiration } from '@frontend/common/src/utils/instruments/getInstrumentStartExpiration.ts';
import { getProviderInstrumentUnderlying } from '@frontend/common/src/utils/instruments/getInstrumentUnderlying.ts';
import { logger } from '@frontend/common/src/utils/Tracing';
import { compact, isEmpty, isEqual, isNil } from 'lodash-es';

import type {
    TCellError,
    TEditablePropertyCell,
    TPackedProviderInstrument,
    TPropertyCell,
    TPropertyRevisionCell,
    TPropertyRow,
    TProviderPropertyRow,
    TRevisionPropertyRow,
} from '../defs.ts';
import { EDataKind, EPropertyGroup, ProviderInstrumentPropertyName } from '../defs.ts';

const MAP_FIELD_PATH_TO_GROUP_PROPERTY = new Map<
    string,
    { group: EPropertyGroup; property: string }
>([
    [
        'amountNotation/value/type',
        {
            group: EPropertyGroup.AmountNotation,
            property: ProviderInstrumentPropertyName.AmountNotationAssetName,
        },
    ],
    [
        'kind/instantSpot/baseAssetId',
        {
            group: EPropertyGroup.Spot,
            property: ProviderInstrumentPropertyName.SpotBaseAssetName,
        },
    ],
    [
        'priceNotation/value/ratio/numerator/value/type',
        {
            group: EPropertyGroup.PriceNotation,
            property: ProviderInstrumentPropertyName.PriceNotationNumeratorAssetName,
        },
    ],
]);

export function packProviderInstruments(
    platformInstrument: TInstrument,
    latest?: boolean,
): TPackedProviderInstrument[] {
    const errors = getCellErrors(platformInstrument);

    return getProviderInstruments(platformInstrument).map((providerInstrument, order) => {
        const settlementType = getProviderInstrumentSettlementType(providerInstrument.details);
        const settlementTime = getProviderInstrumentSettlementTime(providerInstrument.details);
        const startExpiration = getProviderInstrumentStartExpiration(providerInstrument.details);
        const spotData = getProviderInstrumentSpotData(providerInstrument.details);

        return {
            platformInstrument,
            providerInstrument,

            instrumentId: platformInstrument.id,
            order,
            name: providerInstrument.name,
            kind: providerInstrument.details.kind?.type,
            source: providerInstrument.source,
            provider: providerInstrument.provider,
            platformTime: providerInstrument.platformTime as ISO,

            amountNotation: providerInstrument.details.amountNotation,
            priceNotation: providerInstrument.details.priceNotation,
            settlement:
                isNil(settlementType) && isNil(settlementTime)
                    ? undefined
                    : { type: settlementType, time: settlementTime },
            notional: getProviderInstrumentNotional(providerInstrument.details),
            underlying: getProviderInstrumentUnderlying(providerInstrument.details),
            baseAssetName: spotData?.baseAssetName,
            quoteAssetName: spotData?.quoteAssetName,
            startTime: startExpiration?.startTime,
            expirationTime: startExpiration?.expirationTime,
            payoutNotation: getProviderInstrumentPayoutNotation(providerInstrument.details),
            marginNotation: getProviderInstrumentMarginNotation(providerInstrument.details),
            option:
                providerInstrument.details.kind?.type === 'option'
                    ? providerInstrument.details.kind.option
                    : undefined,
            instrumentSwap:
                providerInstrument.details.kind?.type === 'instrumentSwap'
                    ? providerInstrument.details.kind.instrumentSwap
                    : undefined,
            errors,

            latest,
        };
    });
}

function getCellErrors(instrument: TInstrument): undefined | TCellError[] {
    return isEmpty(instrument.instrumentReductionErrors)
        ? undefined
        : compact(instrument.instrumentReductionErrors.map(getCellError));
}

function getCellError(error: TInstrumentReductionError): undefined | TCellError {
    const mergedPath = error.fieldPath.join('/');
    const groupAndProperty = MAP_FIELD_PATH_TO_GROUP_PROPERTY.get(mergedPath);

    if (isNil(groupAndProperty)) {
        logger.error(`Unknown instrument reduction error path "${mergedPath}"`);
        return undefined;
    }

    return { ...groupAndProperty, message: error.message };
}

export function getProviderInstruments(instrument: TInstrument): TProviderInstrument[] {
    // TODO: Do sorting for provider instruments
    return instrument.providerInstruments;
}

export function getDisplayPriceStepRules({ value }: TInstrumentDynamicDataPriceStepRules): string {
    if (isNil(value)) {
        return '';
    }

    const { type } = value;

    switch (type) {
        case 'simple':
            return value.simple.priceDelta.toString();
        case 'table':
            return isEmpty(value.table.rows) ? '' : JSON.stringify(value.table.rows);
        default:
            assertNever(type);
    }
}

export function getPropertyCellValueFormatter<
    T extends TPropertyRow | TProviderPropertyRow | TRevisionPropertyRow,
    TCell extends TPropertyCell | TEditablePropertyCell | TPropertyRevisionCell,
>(timeZone: TimeZone): ValueFormatterFunc<T, TCell> {
    return ({ value }: ValueFormatterParams<T, TCell>): string => {
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
                return data.toString();
            case EDataKind.InstrumentApprovalStatus:
                return statusToDisplayStatus(data.approvalStatus);
            case EDataKind.DynamicDataStatus:
                return dynamicDataStatusToDisplayStatus(data);
            case EDataKind.StepPrice:
                return getDisplayPriceStepRules(data);
            case EDataKind.DateTime:
                return toDayjsWithTimezone(data, timeZone).format(EDateTimeFormats.DateTime);
            case EDataKind.RevisionDateTime:
                return toDayjsWithTimezone(data.date, timeZone).format(EDateTimeFormats.DateTime);
            default:
                assertNever(kind);
        }
    };
}

export function isRevisionPropertyCellEqual(
    left: TPropertyRevisionCell,
    right: TPropertyRevisionCell,
): boolean {
    if (left.kind !== right.kind) {
        return false;
    }

    const { kind, data } = left;

    switch (kind) {
        case EDataKind.Number:
        case EDataKind.String:
        case EDataKind.DateTime:
            return isEqual(data, right.data);
        case EDataKind.InstrumentApprovalStatus:
            return (
                right.kind === EDataKind.InstrumentApprovalStatus &&
                isEqual(data.approvalStatus, right.data.approvalStatus)
            );
        default:
            assertNever(kind);
    }
}
