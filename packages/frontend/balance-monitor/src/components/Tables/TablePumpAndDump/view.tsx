import type { TimeZone } from '@common/types';
import {
    EPumpAndDumpTabSelectors,
    PumpAndDumpTabProps,
} from '@frontend/common/e2e/selectors/balance-monitor/components/pump-and-dump/pump-and-dump.tab.selectors';
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
import { EMPTY_ARRAY } from '@frontend/common/src/utils/const.ts';
import {
    isFailValueDescriptor,
    matchValueDescriptor,
} from '@frontend/common/src/utils/ValueDescriptor/utils.ts';
import { memo, useMemo } from 'react';

import type {
    TPumpDumpInfo,
    TPumpDumpInfoDescriptor,
} from '../../../modules/actions/ModuleSubscribeToCurrentPumpDumpInfo.ts';
import { DEFAULT_ROW_HEIGHT } from '../defs';
import { cnBalanceMonitorTable, cnRoot } from '../style.css';
import { useColumns } from './hooks/useColumn';
import { useGetCSVOptions } from './hooks/useGetCSVOptions';
import { ROW_CLASS_RULES } from './utils';

export const TablePumpAndDump = memo(
    ({
        timeZone,
        pumpDumpInfoDescriptor,
    }: {
        timeZone: TimeZone;
        pumpDumpInfoDescriptor: TPumpDumpInfoDescriptor;
    }) => {
        const columns = useColumns(timeZone);
        const getCSVOptions = useGetCSVOptions();

        const { gridApi, onGridReady } = useGridApi<TPumpDumpInfo>();

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
            tableId: ETableIds.PumpAndDump,
            columns,
            gridApi,
        });

        const { getFilteredData, filteredCount } = useFilteredData(gridApi);
        const { onSelectionChanged, selectedRows } = useRowSelection<TPumpDumpInfo>();

        const pumpDumpInfoItems = useMemo(
            () =>
                matchValueDescriptor(pumpDumpInfoDescriptor, {
                    unsynced(vd) {
                        return isFailValueDescriptor(vd)
                            ? (EMPTY_ARRAY as TPumpDumpInfo[])
                            : undefined;
                    },
                    synced({ value }) {
                        return value;
                    },
                }),
            [pumpDumpInfoDescriptor],
        );

        return (
            <div
                {...PumpAndDumpTabProps[EPumpAndDumpTabSelectors.PumpAndDumpTab]}
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
                        title="Pump&Dump items"
                        count={pumpDumpInfoItems?.length}
                        filteredCount={filteredCount}
                    />
                    <TableLabelExportData
                        selectedRows={selectedRows}
                        getData={getFilteredData}
                        filename="pumpAndDump"
                        getOptions={getCSVOptions}
                    />
                </TableLabels>
                <AgTableWithRouterSync
                    className={cnBalanceMonitorTable}
                    id={ETableIds.PumpAndDump}
                    rowKey="key"
                    rowData={pumpDumpInfoItems}
                    columnDefs={columns}
                    rowClassRules={ROW_CLASS_RULES}
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
