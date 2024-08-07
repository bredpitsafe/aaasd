import type {
    TInstrument,
    TInstrumentRevision,
} from '@backend/bff/src/modules/instruments/schemas/defs.ts';
import type { ISO, TimeZone } from '@common/types';
import { EDateTimeFormats } from '@common/types';
import { toDayjsWithTimezone } from '@common/utils';
import type { CellClassParams, ColDef, ValueGetterParams } from '@frontend/ag-grid';
import { useDeepEqualProp } from '@frontend/common/src/hooks/useDeepEqualProp.ts';
import type { TValueDescriptor2 } from '@frontend/common/src/utils/ValueDescriptor/types.ts';
import cn from 'classnames';
import { isNil, isNumber } from 'lodash-es';
import { useMemo } from 'react';

import type { TRevisionList } from '../../../../types/instruments.ts';
import { CellValueRenderer } from '../../CellValueRenderer.tsx';
import type {
    TInstrumentWithRevisions,
    TPropertyRevisionCell,
    TRevisionPropertyRow,
} from '../../defs.ts';
import { InstrumentHeader } from '../../InstrumentHeader.tsx';
import { RevisionSelectorHeader } from '../../RevisionSelectorHeader.tsx';
import { getPropertyCellValueFormatter } from '../../utils/instruments.ts';
import { PropertyHeader } from '../PropertyHeader.tsx';
import { cnCellHasDiff, cnPinnedHeaderColumns } from '../styles.css.ts';

export function useColumns(
    instrumentIds: TInstrumentWithRevisions[],
    instruments: ReadonlyMap<number, { instrument: TInstrument; platformTime?: ISO }[]>,
    revisionsDesc: TValueDescriptor2<ReadonlyMap<number, TInstrumentRevision[]>>,
    timeZone: TimeZone,
    removeInstrument: (instrumentId: number) => void,
    removeInstrumentRevision: (instrumentId: number, revisionPlatformTime?: ISO) => void,
    setInstrumentRevisions: (instrumentId: number, revisions: TRevisionList) => void,
    showOnlyRowsWithDiff: boolean,
    toggleShowOnlyRowsWithDiff: VoidFunction,
): ColDef<TRevisionPropertyRow>[] {
    const rawInstrumentDetails = useDeepEqualProp(
        useMemo(
            () =>
                instrumentIds.map((item) => {
                    const instrumentId = isNumber(item) ? item : item.instrumentId;

                    const groupInstrument = instruments
                        .get(instrumentId)
                        ?.find(
                            ({ instrument, platformTime }) =>
                                instrument.id === instrumentId && isNil(platformTime),
                        );

                    return {
                        id: instrumentId,
                        name: groupInstrument?.instrument?.name ?? instrumentId.toString(),
                        items: (isNumber(item)
                            ? [{ instrumentId: item, platformTime: undefined }]
                            : item.platformTime.map((platformTime) => ({
                                  instrumentId: item.instrumentId,
                                  platformTime,
                              }))
                        ).map(
                            ({
                                instrumentId,
                                platformTime: itemPlatformTime,
                            }): {
                                field: keyof TRevisionPropertyRow;
                                name: string;
                                platformTime: ISO | undefined;
                            } => {
                                const instrument = instruments
                                    .get(instrumentId)
                                    ?.find(
                                        ({ instrument, platformTime }) =>
                                            instrument.id === instrumentId &&
                                            (isNumber(item) || itemPlatformTime === platformTime),
                                    );

                                return {
                                    field: `indicator-id-${instrumentId}-rev-${
                                        isNil(itemPlatformTime) ? 'latest' : itemPlatformTime
                                    }`,
                                    name: isNil(itemPlatformTime)
                                        ? 'Latest'
                                        : toDayjsWithTimezone(
                                              (instrument?.instrument?.platformTime ??
                                                  itemPlatformTime) as ISO,
                                              timeZone,
                                          ).format(EDateTimeFormats.DateTime),
                                    platformTime: itemPlatformTime,
                                };
                            },
                        ),
                    };
                }),
            [instrumentIds, instruments, timeZone],
        ),
    );

    return useMemo(
        () =>
            [
                {
                    field: 'group',
                    rowGroup: true,
                    rowGroupIndex: 1,
                    hide: true,
                    maxWidth: 150,
                },
                {
                    field: 'property',
                    headerName: 'Property',
                    pinned: 'left',
                    cellClass: cnPinnedHeaderColumns,
                    headerComponent: PropertyHeader,
                    headerComponentParams: {
                        showOnlyRowsWithDiff,
                        toggleShowOnlyRowsWithDiff,
                    },
                    minWidth: 185,
                    maxWidth: 185,
                },
                ...rawInstrumentDetails.map(({ id, name, items }) => ({
                    headerGroupComponent: RevisionSelectorHeader,
                    headerGroupComponentParams: {
                        removeInstrument: removeInstrument.bind(undefined, id),
                        revisions: revisionsDesc.value?.get(id),
                        timeZone,
                        selectedRevisions: items.map(({ platformTime }) => platformTime),
                        setInstrumentRevisions: setInstrumentRevisions.bind(undefined, id),
                    },
                    groupId: id,
                    headerName: name,
                    marryChildren: true,
                    children: items.map(
                        ({ field, name, platformTime }): ColDef<TRevisionPropertyRow> => ({
                            field,
                            valueGetter: ({ data }: ValueGetterParams<TRevisionPropertyRow>) =>
                                data?.[field],
                            headerComponent: InstrumentHeader,
                            headerComponentParams: {
                                removeInstrument: removeInstrumentRevision.bind(
                                    undefined,
                                    id,
                                    platformTime,
                                ),
                            },
                            headerName: name,
                            cellRenderer: CellValueRenderer,
                            cellRendererParams: { timeZone, skipActions: true },
                            cellClass: ({
                                value,
                            }: CellClassParams<
                                TRevisionPropertyRow,
                                undefined | TPropertyRevisionCell
                            >) =>
                                cn({
                                    [cnCellHasDiff]: value?.hasDiff ?? false,
                                }),
                            valueFormatter: getPropertyCellValueFormatter(timeZone),
                            useValueFormatterForExport: true,
                            suppressMovable: false,
                        }),
                    ),
                })),
            ] as ColDef<TRevisionPropertyRow>[],
        [
            showOnlyRowsWithDiff,
            toggleShowOnlyRowsWithDiff,
            rawInstrumentDetails,
            removeInstrument,
            removeInstrumentRevision,
            setInstrumentRevisions,
            revisionsDesc.value,
            timeZone,
        ],
    );
}
