import {
    ComponentStatusesTabProps,
    EComponentStatusesTabSelectors,
} from '@frontend/common/e2e/selectors/balance-monitor/components/component-statuses/component-statuses.tab.selectors';
import { AgTableWithRouterSync } from '@frontend/common/src/components/AgTable/AgTableWithRouterSync';
import { useFilteredData } from '@frontend/common/src/components/AgTable/hooks/useFilteredData';
import { useGridApi } from '@frontend/common/src/components/AgTable/hooks/useGridApi';
import { useRegExpTableFilter } from '@frontend/common/src/components/AgTable/hooks/useRegExpTableFilter';
import { useRowSelection } from '@frontend/common/src/components/AgTable/hooks/useRowSelection';
import { TableLabelCount } from '@frontend/common/src/components/TableLabel/Count';
import { TableLabelExportData } from '@frontend/common/src/components/TableLabel/TableLabelExportData';
import { TableLabelRegExpFilter } from '@frontend/common/src/components/TableLabel/TableLabelRegExpFilter';
import { TableLabels } from '@frontend/common/src/components/TableLabel/TableLabels';
import { ETableIds } from '@frontend/common/src/modules/clientTableFilters/data';
import type { TComponentStatusInfo } from '@frontend/common/src/types/domain/balanceMonitor/defs';
import { matchValueDescriptor } from '@frontend/common/src/utils/ValueDescriptor/utils.ts';
import { memo, useMemo } from 'react';

import type { TComponentStatusesDescriptor } from '../../../modules/actions/ModuleSubscribeToComponentStatusesOnCurrentStage.ts';
import { DEFAULT_ROW_HEIGHT } from '../defs';
import { cnBalanceMonitorTable, cnRoot } from '../style.css';
import { useColumns } from './hooks/useColumn';
import { useGetCSVOptions } from './hooks/useGetCSVOptions';

export const TableComponentStatuses = memo(
    ({
        componentStatusesDescriptor,
    }: {
        componentStatusesDescriptor: TComponentStatusesDescriptor;
    }) => {
        const columns = useColumns();
        const getCSVOptions = useGetCSVOptions();

        const { gridApi, onGridReady } = useGridApi<TComponentStatusInfo>();

        const {
            regExp,
            filterValid,
            templateExample,
            caseSensitive,
            toggleCaseSensitive,
            setRegExp,
            isExternalFilterPresent,
            doesExternalFilterPass,
        } = useRegExpTableFilter({
            tableId: ETableIds.ComponentStatuses,
            columns,
            gridApi,
        });

        const { getFilteredData, filteredCount } = useFilteredData(gridApi);
        const { onSelectionChanged, selectedRows } = useRowSelection<TComponentStatusInfo>();

        const componentStatusesItems = useMemo(
            () =>
                matchValueDescriptor(componentStatusesDescriptor, {
                    unsynced() {
                        return undefined;
                    },
                    synced({ value }) {
                        return value;
                    },
                }),
            [componentStatusesDescriptor],
        );

        return (
            <div
                {...ComponentStatusesTabProps[EComponentStatusesTabSelectors.ComponentStatusesTab]}
                className={cnRoot}
            >
                <TableLabels>
                    <TableLabelRegExpFilter
                        inputPlaceholder={templateExample}
                        inputValue={regExp}
                        inputValid={filterValid}
                        onInputChange={setRegExp}
                        caseSensitive={caseSensitive}
                        onCaseSensitiveToggle={toggleCaseSensitive}
                    />
                    <TableLabelCount
                        title="Component Statuses"
                        count={componentStatusesItems?.length}
                        filteredCount={filteredCount}
                    />
                    <TableLabelExportData
                        selectedRows={selectedRows}
                        getData={getFilteredData}
                        filename="componentStatuses"
                        getOptions={getCSVOptions}
                    />
                </TableLabels>
                <AgTableWithRouterSync
                    className={cnBalanceMonitorTable}
                    id={ETableIds.ComponentStatuses}
                    rowKey="componentId"
                    rowData={componentStatusesItems}
                    columnDefs={columns}
                    rowSelection="multiple"
                    onSelectionChanged={onSelectionChanged}
                    onGridReady={onGridReady}
                    isExternalFilterPresent={isExternalFilterPresent}
                    doesExternalFilterPass={doesExternalFilterPass}
                    floatingFiltersHeight={30}
                    enableRangeSelection
                    tooltipShowDelay={0}
                    tooltipHideDelay={2000}
                    rowHeight={DEFAULT_ROW_HEIGHT}
                />
            </div>
        );
    },
);
