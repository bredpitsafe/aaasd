import type {
    TInstrument,
    TInstrumentRevision,
} from '@backend/bff/src/modules/instruments/schemas/defs.ts';
import type { ISO, TimeZone } from '@common/types';
import type { ColDef, GetRowIdParams, IRowNode } from '@frontend/ag-grid';
import { AgTableWithFilterSync } from '@frontend/common/src/components/AgTable/AgTableWithFilterSync.tsx';
import { useGridApi } from '@frontend/common/src/components/AgTable/hooks/useGridApi.ts';
import { Error } from '@frontend/common/src/components/Error/view';
import { LoadingOverlay } from '@frontend/common/src/components/overlays/LoadingOverlay';
import { ETableIds } from '@frontend/common/src/modules/clientTableFilters/data.ts';
import { EMPTY_MAP } from '@frontend/common/src/utils/const.ts';
import { useFunction } from '@frontend/common/src/utils/React/useFunction.ts';
import type { TValueDescriptor2 } from '@frontend/common/src/utils/ValueDescriptor/types.ts';
import {
    isFailValueDescriptor,
    isSyncedValueDescriptor,
} from '@frontend/common/src/utils/ValueDescriptor/utils.ts';
import { isNil } from 'lodash-es';
import { memo, useEffect, useMemo } from 'react';
import { useToggle } from 'react-use';

import type { TRevisionList } from '../../../types/instruments.ts';
import type { TInstrumentWithRevisions, TRevisionPropertyRow } from '../defs.ts';
import { cnRoot } from '../view.css.ts';
import { useColumns } from './hooks/useColumns.ts';
import { useTransposeInstruments } from './hooks/useTransposeInstruments.ts';
import { ROW_CLASS_RULES } from './utils.ts';

export const TableTransposeInstrumentRevisions = memo(
    ({
        revisionInstrumentsIds,
        revisionsDesc,
        instrumentsDesc,
        timeZone,
        onRemoveInstrument,
        onRemoveInstrumentRevision,
        onSetInstrumentRevisions,
    }: {
        timeZone: TimeZone;
        revisionsDesc: TValueDescriptor2<ReadonlyMap<number, TInstrumentRevision[]>>;
        instrumentsDesc: TValueDescriptor2<
            ReadonlyMap<number, { instrument: TInstrument; platformTime?: ISO }[]>
        >;
        revisionInstrumentsIds: TInstrumentWithRevisions[];
        onRemoveInstrument: (instrumentId: number) => void;
        onRemoveInstrumentRevision: (instrumentId: number, revisionPlatformTime?: ISO) => void;
        onSetInstrumentRevisions: (instrumentId: number, revisions: TRevisionList) => void;
    }) => {
        const { gridApi, onGridReady } = useGridApi<TRevisionPropertyRow>();

        const [showOnlyRowsWithDiff, toggleShowOnlyRowsWithDiff] = useToggle(false);

        const instrumentColumns = useColumns(
            revisionInstrumentsIds,
            instrumentsDesc.value ?? EMPTY_MAP,
            revisionsDesc,
            timeZone,
            onRemoveInstrument,
            onRemoveInstrumentRevision,
            onSetInstrumentRevisions,
            showOnlyRowsWithDiff,
            toggleShowOnlyRowsWithDiff,
        );

        const getRowId = useFunction(
            ({ data: { group, property } }: GetRowIdParams<TRevisionPropertyRow>) =>
                `${group}-${property}`,
        );
        const groupRowRendererParams = useMemo(
            () => ({
                suppressCount: true,
            }),
            [],
        );
        const defaultColDef = useMemo(
            (): ColDef<TRevisionPropertyRow> => ({
                filter: false,
                sortable: false,
                suppressMovable: true,
            }),
            [],
        );

        const instrumentRows = useTransposeInstruments(instrumentsDesc, revisionInstrumentsIds);

        const isExternalFilterPresent = useFunction(() => showOnlyRowsWithDiff);
        const doesExternalFilterPass = useFunction(
            ({ data }: IRowNode<TRevisionPropertyRow>) => !isNil(data) && data.hasDiff,
        );

        useEffect(
            () => gridApi?.onFilterChanged(),
            // eslint-disable-next-line react-hooks/exhaustive-deps
            [showOnlyRowsWithDiff],
        );

        return (
            <div className={cnRoot}>
                {isSyncedValueDescriptor(instrumentsDesc) ? (
                    <AgTableWithFilterSync<TRevisionPropertyRow>
                        onGridReady={onGridReady}
                        id={ETableIds.TransposeInstrumentRevisions}
                        rowData={instrumentRows}
                        getRowId={getRowId}
                        columnDefs={instrumentColumns}
                        rowSelection="multiple"
                        groupDefaultExpanded={-1}
                        rowGroupPanelShow="never"
                        groupDisplayType="groupRows"
                        groupRowRendererParams={groupRowRendererParams}
                        rowClassRules={ROW_CLASS_RULES}
                        defaultColDef={defaultColDef}
                        isExternalFilterPresent={isExternalFilterPresent}
                        doesExternalFilterPass={doesExternalFilterPass}
                    />
                ) : isFailValueDescriptor(instrumentsDesc) ? (
                    <Error status="error" title="Failed to load instruments" />
                ) : (
                    <LoadingOverlay text="Loading instruments..." />
                )}
            </div>
        );
    },
);
