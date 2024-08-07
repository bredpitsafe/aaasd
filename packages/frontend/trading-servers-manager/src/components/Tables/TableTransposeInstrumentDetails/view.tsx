import type { TInstrument } from '@backend/bff/src/modules/instruments/schemas/defs.ts';
import type { TimeZone } from '@common/types';
import type { ColDef, GetRowIdParams } from '@frontend/ag-grid';
import { AgTableWithFilterSync } from '@frontend/common/src/components/AgTable/AgTableWithFilterSync.tsx';
import { Error } from '@frontend/common/src/components/Error/view';
import { LoadingOverlay } from '@frontend/common/src/components/overlays/LoadingOverlay';
import { ETableIds } from '@frontend/common/src/modules/clientTableFilters/data.ts';
import { EMPTY_ARRAY } from '@frontend/common/src/utils/const.ts';
import { useFunction } from '@frontend/common/src/utils/React/useFunction.ts';
import type { TValueDescriptor2 } from '@frontend/common/src/utils/ValueDescriptor/types.ts';
import {
    isFailValueDescriptor,
    isSyncedValueDescriptor,
} from '@frontend/common/src/utils/ValueDescriptor/utils.ts';
import { memo, useMemo } from 'react';

import type { TFullInstrument, TPropertyRow } from '../defs.ts';
import { cnRoot } from '../view.css.ts';
import { useColumns } from './hooks/useColumns.ts';
import { useGetContextMenuItems } from './hooks/useGetContextMenuItems.ts';
import { useTransposeFullInstruments } from './hooks/useTransposeFullInstruments.ts';
import { ROW_CLASS_RULES } from './utils.ts';

export const TableTransposeInstrumentDetails = memo(
    ({
        fullInstrumentsDesc,
        timeZone,
        onRemoveInstrument,
        showProviderInstrumentsDetails,
        showInstrumentsRevisions,
    }: {
        fullInstrumentsDesc: TValueDescriptor2<TFullInstrument[]>;
        timeZone: TimeZone;
        onRemoveInstrument: (instrumentId: number) => void;
        showProviderInstrumentsDetails: (instruments: TInstrument[]) => Promise<boolean>;
        showInstrumentsRevisions: (instruments: TInstrument[]) => Promise<boolean>;
    }) => {
        const instruments = fullInstrumentsDesc.value ?? EMPTY_ARRAY;

        const instrumentColumns = useColumns(instruments, timeZone, onRemoveInstrument);
        const instrumentRows = useTransposeFullInstruments(fullInstrumentsDesc);

        const getRowId = useFunction(
            ({ data: { group, property } }: GetRowIdParams<TPropertyRow>) => `${group}-${property}`,
        );
        const groupRowRendererParams = useMemo(
            () => ({
                suppressCount: true,
            }),
            [],
        );
        const defaultColDef = useMemo(
            (): ColDef<TPropertyRow> => ({
                filter: false,
                sortable: false,
                suppressMovable: true,
            }),
            [],
        );

        const getContextMenuItems = useGetContextMenuItems({
            instruments,
            showProviderInstrumentsDetails,
            showInstrumentsRevisions,
        });

        return (
            <div className={cnRoot}>
                {isSyncedValueDescriptor(fullInstrumentsDesc) ? (
                    <AgTableWithFilterSync<TPropertyRow>
                        id={ETableIds.TransposeInstrumentDetails}
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
                        getContextMenuItems={getContextMenuItems}
                    />
                ) : isFailValueDescriptor(fullInstrumentsDesc) ? (
                    <Error status="error" title="Failed to load instruments" />
                ) : (
                    <LoadingOverlay text="Loading instruments..." />
                )}
            </div>
        );
    },
);
