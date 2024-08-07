import type { TInstrument } from '@backend/bff/src/modules/instruments/schemas/defs';
import type { ISO } from '@common/types';
import type { RowClassParams, RowClassRules } from '@frontend/ag-grid';
import { getInstrumentMarginNotation } from '@frontend/common/src/utils/instruments/getInstrumentMarginNotation.ts';
import { getInstrumentNotional } from '@frontend/common/src/utils/instruments/getInstrumentNotional.ts';
import { getInstrumentPayoutNotation } from '@frontend/common/src/utils/instruments/getInstrumentPayoutNotation.ts';
import { getInstrumentSettlementTime } from '@frontend/common/src/utils/instruments/getinstrumentSettlementTime.ts';
import { getInstrumentSettlementType } from '@frontend/common/src/utils/instruments/getInstrumentSettlementType.ts';
import { getInstrumentSpotData } from '@frontend/common/src/utils/instruments/getInstrumentSpotData.ts';
import { getInstrumentStartExpiration } from '@frontend/common/src/utils/instruments/getInstrumentStartExpiration.ts';
import { getInstrumentUnderlying } from '@frontend/common/src/utils/instruments/getInstrumentUnderlying.ts';
import { isNil, isNumber, isString } from 'lodash-es';

import type {
    EPropertyGroup,
    TInstrumentWithRevisions,
    TPackedInstrument,
    TPropertyRevisionCell,
    TRevisionPropertyRow,
} from '../defs';
import { isRevisionPropertyCellEqual } from '../utils/instruments.ts';
import { cnGroup } from './styles.css.ts';

export const ROW_CLASS_RULES: RowClassRules<TRevisionPropertyRow> = {
    [cnGroup]: ({ node }: RowClassParams<TRevisionPropertyRow>) => isString(node.key),
};

export function packInstrument(instrument: TInstrument, latest: boolean): TPackedInstrument {
    const settlementType = getInstrumentSettlementType(instrument);
    const settlementTime = getInstrumentSettlementTime(instrument);
    const startExpiration = getInstrumentStartExpiration(instrument);
    const spotData = getInstrumentSpotData(instrument);

    return {
        instrument: instrument,
        id: instrument.id,
        name: instrument.name,
        kind: instrument.kind?.type,
        exchange: instrument.exchange,
        approvalStatus: instrument.approvalStatus,
        amountNotation: instrument.amountNotation,
        priceNotation: instrument.priceNotation,
        settlement:
            isNil(settlementType) && isNil(settlementTime)
                ? undefined
                : { type: settlementType, time: settlementTime },
        notional: getInstrumentNotional(instrument),
        underlying: getInstrumentUnderlying(instrument),
        baseAssetId: spotData?.baseAssetId,
        quoteAssetId: spotData?.quoteAssetId,
        startTime: startExpiration?.startTime,
        expirationTime: startExpiration?.expirationTime,
        payoutNotation: getInstrumentPayoutNotation(instrument),
        marginNotation: getInstrumentMarginNotation(instrument),
        option: instrument.kind?.type === 'option' ? instrument.kind.option : undefined,
        instrumentSwap:
            instrument.kind?.type === 'instrumentSwap' ? instrument.kind.instrumentSwap : undefined,
        user: instrument.user,
        platformTime: instrument.platformTime as ISO,
        latest,
    };
}

export function getInstrumentsRow(
    group: EPropertyGroup,
    property: string,
    items: TPackedInstrument[],
    getter: (item: TPackedInstrument) => Omit<TPropertyRevisionCell, 'hasDiff'>,
    revisionInstrumentsIds: TInstrumentWithRevisions[],
): TRevisionPropertyRow {
    const columnsDescriptors = items
        .filter((item) => {
            const id = item.id;
            const revision = item.latest ? undefined : (item.platformTime as ISO);

            return revisionInstrumentsIds.some((complexId) =>
                isNumber(complexId)
                    ? complexId === id && isNil(revision)
                    : complexId.instrumentId === id &&
                      (complexId.platformTime as (ISO | undefined)[]).includes(revision),
            );
        })
        .map(
            (
                item,
            ): {
                key: Exclude<keyof TRevisionPropertyRow, 'group' | 'property' | 'hasDiff'>;
                cell: Omit<TPropertyRevisionCell, 'hasDiff'>;
                id: number;
            } => ({
                key: `indicator-id-${item.id}-rev-${item.latest ? 'latest' : item.platformTime}`,
                cell: getter(item),
                id: item.id,
            }),
        );

    const lastValue = new Map<number, Omit<TPropertyRevisionCell, 'hasDiff'>>();
    const hasDiff = new Set<number>();

    for (const { id, cell } of columnsDescriptors) {
        const existingCell = lastValue.get(id);

        if (isNil(existingCell)) {
            lastValue.set(id, cell);
        } else if (
            !hasDiff.has(id) &&
            !isRevisionPropertyCellEqual(
                existingCell as TPropertyRevisionCell,
                cell as TPropertyRevisionCell,
            )
        ) {
            hasDiff.add(id);
        }
    }

    const columns = columnsDescriptors.reduce(
        (acc, { id, key, cell }) => {
            acc[key] = { ...cell, hasDiff: hasDiff.has(id) } as TPropertyRevisionCell;
            return acc;
        },
        {} as Omit<TRevisionPropertyRow, 'group' | 'property' | 'hasDiff'>,
    );

    return { group, property, hasDiff: hasDiff.size > 0, ...columns };
}
