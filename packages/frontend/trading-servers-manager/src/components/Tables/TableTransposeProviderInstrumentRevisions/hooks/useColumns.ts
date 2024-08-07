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
import { isNumber } from 'lodash-es';
import { useMemo } from 'react';

import type { TRevisionList } from '../../../../types/instruments.ts';
import { CellValueRenderer } from '../../CellValueRenderer.tsx';
import type {
    TInstrumentWithRevisions,
    TPackedProviderInstrument,
    TPropertyRevisionCell,
    TRevisionProviderPropertyRow,
} from '../../defs.ts';
import { RevisionSelectorHeader } from '../../RevisionSelectorHeader.tsx';
import { getPropertyCellValueFormatter } from '../../utils/instruments.ts';
import { PropertyHeader } from '../PropertyHeader.tsx';
import { cnCellHasDiff, cnPinnedHeaderColumns } from '../styles.css.ts';

export function useColumns(
    instrumentIds: TInstrumentWithRevisions[],
    displayProviderInstruments:
        | { instrument: TInstrument; providerInstruments: TPackedProviderInstrument[] }[]
        | undefined,
    revisionsDesc: TValueDescriptor2<ReadonlyMap<number, TInstrumentRevision[]>>,
    timeZone: TimeZone,
    removeInstrument: (instrumentId: number) => void,
    setInstrumentRevisions: (instrumentId: number, revisions: TRevisionList) => void,
    showOnlyRowsWithDiff: boolean,
    toggleShowOnlyRowsWithDiff: VoidFunction,
): ColDef<TRevisionProviderPropertyRow>[] {
    const revisionsGroupsDetails = useDeepEqualProp(
        useMemo(
            () =>
                displayProviderInstruments?.map(({ instrument, providerInstruments }) => ({
                    id: instrument.id,
                    name: instrument.name,
                    items: providerInstruments.map(
                        ({
                            name,
                            provider,
                            platformInstrument,
                            platformTime,
                            latest,
                        }): { field: keyof TRevisionProviderPropertyRow; name: string } => ({
                            field: `indicator-name-${name}-rev-${
                                latest ? 'latest' : (platformInstrument.platformTime as ISO)
                            }-provider-${provider}-rev-${platformTime as ISO}`,
                            name: `${provider} | ${
                                latest
                                    ? 'Latest'
                                    : toDayjsWithTimezone(
                                          platformInstrument.platformTime as ISO,
                                          timeZone,
                                      ).format(EDateTimeFormats.DateTime)
                            }`,
                        }),
                    ),
                })),
            [displayProviderInstruments, timeZone],
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
                ...(revisionsGroupsDetails ?? []).map(({ id, name, items }) => {
                    const complexId = instrumentIds.find((complexId) =>
                        isNumber(complexId) ? complexId === id : complexId.instrumentId === id,
                    );

                    return {
                        headerGroupComponent: RevisionSelectorHeader,
                        headerGroupComponentParams: {
                            removeInstrument: removeInstrument.bind(undefined, id),
                            revisions: revisionsDesc.value?.get(id),
                            timeZone,
                            selectedRevisions: isNumber(complexId)
                                ? [undefined]
                                : complexId?.platformTime,
                            setInstrumentRevisions: setInstrumentRevisions.bind(undefined, id),
                        },
                        groupId: id,
                        headerName: name,
                        marryChildren: true,
                        children: items.map(
                            ({ field, name }): ColDef<TRevisionProviderPropertyRow> => ({
                                field,
                                valueGetter: ({
                                    data,
                                }: ValueGetterParams<TRevisionProviderPropertyRow>) =>
                                    data?.[field],
                                headerName: name,
                                cellRenderer: CellValueRenderer,
                                cellRendererParams: { timeZone, skipActions: true },
                                cellClass: ({
                                    value,
                                }: CellClassParams<
                                    TRevisionProviderPropertyRow,
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
                    };
                }),
            ] as ColDef<TRevisionProviderPropertyRow>[],
        [
            setInstrumentRevisions,
            instrumentIds,
            removeInstrument,
            revisionsDesc.value,
            revisionsGroupsDetails,
            showOnlyRowsWithDiff,
            timeZone,
            toggleShowOnlyRowsWithDiff,
        ],
    );
}
