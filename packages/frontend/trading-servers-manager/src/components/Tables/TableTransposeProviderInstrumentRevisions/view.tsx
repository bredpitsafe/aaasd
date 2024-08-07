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
import type { TInstrumentWithRevisions, TRevisionProviderPropertyRow } from '../defs.ts';
import { cnRoot } from '../view.css.ts';
import { useColumns } from './hooks/useColumns.ts';
import { usePackedProviderInstruments } from './hooks/usePackedProviderInstruments.ts';
import { useTransposeProviderInstruments } from './hooks/useTransposeProviderInstruments.ts';
import { ROW_CLASS_RULES } from './utils.ts';

export const TableTransposeProviderInstrumentRevisions = memo(
    ({
        revisionInstrumentsIds,
        revisionsDesc,
        instrumentsDesc,
        timeZone,
        onRemoveInstrument,
        onSetInstrumentRevisions,
    }: {
        timeZone: TimeZone;
        revisionsDesc: TValueDescriptor2<ReadonlyMap<number, TInstrumentRevision[]>>;
        instrumentsDesc: TValueDescriptor2<
            ReadonlyMap<number, { instrument: TInstrument; platformTime?: ISO }[]>
        >;
        revisionInstrumentsIds: TInstrumentWithRevisions[];
        onRemoveInstrument: (instrumentId: number) => void;
        onSetInstrumentRevisions: (instrumentId: number, revisions: TRevisionList) => void;
    }) => {
        const { gridApi, onGridReady } = useGridApi<TRevisionProviderPropertyRow>();

        const [showOnlyRowsWithDiff, toggleShowOnlyRowsWithDiff] = useToggle(false);

        const displayProviderInstruments = usePackedProviderInstruments(
            revisionInstrumentsIds,
            instrumentsDesc,
        );

        const instrumentColumns = useColumns(
            revisionInstrumentsIds,
            displayProviderInstruments,
            revisionsDesc,
            timeZone,
            onRemoveInstrument,
            onSetInstrumentRevisions,
            showOnlyRowsWithDiff,
            toggleShowOnlyRowsWithDiff,
        );

        const getRowId = useFunction(
            ({ data: { group, property } }: GetRowIdParams<TRevisionProviderPropertyRow>) =>
                `${group}-${property}`,
        );
        const groupRowRendererParams = useMemo(
            () => ({
                suppressCount: true,
            }),
            [],
        );
        const defaultColDef = useMemo(
            (): ColDef<TRevisionProviderPropertyRow> => ({
                filter: false,
                sortable: false,
                suppressMovable: true,
            }),
            [],
        );

        const providerInstrumentRows = useTransposeProviderInstruments(
            displayProviderInstruments,
            revisionInstrumentsIds,
        );

        const isExternalFilterPresent = useFunction(() => showOnlyRowsWithDiff);
        const doesExternalFilterPass = useFunction(
            ({ data }: IRowNode<TRevisionProviderPropertyRow>) => !isNil(data) && data.hasDiff,
        );

        useEffect(
            () => gridApi?.onFilterChanged(),
            // eslint-disable-next-line react-hooks/exhaustive-deps
            [showOnlyRowsWithDiff],
        );

        return (
            <div className={cnRoot}>
                {isSyncedValueDescriptor(instrumentsDesc) ? (
                    <AgTableWithFilterSync<TRevisionProviderPropertyRow>
                        onGridReady={onGridReady}
                        id={ETableIds.TransposeProviderInstrumentRevisions}
                        rowData={providerInstrumentRows}
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
