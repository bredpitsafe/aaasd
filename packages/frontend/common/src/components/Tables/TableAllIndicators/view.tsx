import type { ISO, Milliseconds, TimeZone } from '@common/types';
import { isEmpty, isNil } from 'lodash-es';
import type { ReactElement } from 'react';

import { createTestProps } from '../../../../e2e';
import { EIndicatorsTabSelectors } from '../../../../e2e/selectors/trading-servers-manager/components/indicators-tab/indicators.tab.selectors';
import type { TIndicator } from '../../../modules/actions/indicators/defs';
import { ETableIds } from '../../../modules/clientTableFilters/data';
import type { TSocketName } from '../../../types/domain/sockets';
import { useFunction } from '../../../utils/React/useFunction';
import { AgTableWithRouterSync } from '../../AgTable/AgTableWithRouterSync';
import { useFilteredData } from '../../AgTable/hooks/useFilteredData';
import { useGridApi } from '../../AgTable/hooks/useGridApi';
import { useInfinityDataSource } from '../../AgTable/hooks/useInfinityDataSource';
import type { TUseInfinityHistoryItemsReturnType } from '../../AgTable/hooks/useInfinityHistoryItems';
import { useRowSelection } from '../../AgTable/hooks/useRowSelection';
import { ExactDatePicker } from '../../ExactDatePicker';
import { TableLabelLastUpdate } from '../../TableLabel/LastUpdate';
import { TableLabel } from '../../TableLabel/TableLabel';
import { TableLabelExportData } from '../../TableLabel/TableLabelExportData';
import { TableLabelIndicatorsDashboard } from '../../TableLabel/TableLabelIndicatorsDashboard';
import { TableLabelMenuSelect } from '../../TableLabel/TableLabelMenuSelect';
import { TableLabelRegExpFilter } from '../../TableLabel/TableLabelRegExpFilter';
import { TableLabels } from '../../TableLabel/TableLabels';
import { useIndicatorsColumns } from './columns';
import { getCSVOptions } from './export';
import type { TUseMinUpdateTimePresetsReturnType } from './hooks/useConnectedMinUpdateTimePresets';
import { EMinUpdateTimePresets } from './hooks/useConnectedMinUpdateTimePresets';
import { cnDatePicker, cnDatePickerTableLabel, cnRoot, cnTable } from './style.css';

export type TableIndicatorsProps = {
    timeZone: TimeZone;
    updateTime: undefined | Milliseconds;
    exportFilename: string;

    socketName?: TSocketName;
    backtestingRunId?: number;
    onDashboardLinkClick: (url: string, name: string) => void;

    date: undefined | ISO;
    onChangeDate: (date: undefined | ISO) => void;

    regExp?: string;
    onRegExpChange: (re: string) => void;
    caseSensitive?: boolean;
    onToggleCaseSensitive?: (value?: boolean) => void;

    infinityHistoryItems: TUseInfinityHistoryItemsReturnType<TIndicator>;
} & TUseMinUpdateTimePresetsReturnType;

export function TableIndicators(props: TableIndicatorsProps): ReactElement {
    const { gridApi, onGridReady } = useGridApi<TIndicator>();

    const columns = useIndicatorsColumns(props);

    const { getFilteredData } = useFilteredData(gridApi);

    const { onSelectionChanged, selectedRows } = useRowSelection<TIndicator>();

    const infinityDataSourceProps = useInfinityDataSource(gridApi, {
        getRows: props.infinityHistoryItems.getItems$,
        refreshInfiniteCacheTrigger$: props.infinityHistoryItems.updateTrigger$,
    });

    const handleGetCSVOptions = useFunction(() => getCSVOptions(props.timeZone));

    return (
        <div {...createTestProps(EIndicatorsTabSelectors.IndicatorsTab)} className={cnRoot}>
            <TableLabels>
                <TableLabelRegExpFilter
                    inputPlaceholder="Name Regexp"
                    inputValue={props.regExp}
                    onInputChange={props.onRegExpChange}
                    caseSensitive={props.caseSensitive}
                    onCaseSensitiveToggle={props.onToggleCaseSensitive}
                    inputValid={isNil(props.date) || !isEmpty(props.regExp)}
                />
                {props.minUpdateTimePreset === EMinUpdateTimePresets.Inf && (
                    <TableLabel className={cnDatePickerTableLabel}>
                        <ExactDatePicker
                            className={cnDatePicker}
                            size="small"
                            value={props.date}
                            timeZone={props.timeZone}
                            onChange={props.onChangeDate}
                        />
                    </TableLabel>
                )}
                {props.date === undefined && (
                    <TableLabelMenuSelect
                        items={props.minUpdateTimePresets}
                        selected={props.minUpdateTimePreset}
                        onChange={props.onMinUpdateTimePresetChange}
                        {...createTestProps(EIndicatorsTabSelectors.UpdateTimeButton)}
                    />
                )}
                <TableLabelLastUpdate
                    time={props.updateTime}
                    timeZone={props.timeZone}
                    {...createTestProps(EIndicatorsTabSelectors.LastUpdateText)}
                />
                <TableLabelExportData
                    getData={getFilteredData}
                    selectedRows={selectedRows}
                    filename={props.exportFilename}
                    getOptions={handleGetCSVOptions}
                />
                <TableLabelIndicatorsDashboard
                    socketName={props.socketName}
                    selectedRows={selectedRows}
                    backtestingRunId={props.backtestingRunId}
                    onClick={props.onDashboardLinkClick}
                />
            </TableLabels>
            <div className={cnTable}>
                <AgTableWithRouterSync
                    id={ETableIds.AllIndicators}
                    {...infinityDataSourceProps}
                    rowKey="name"
                    columnDefs={columns}
                    rowSelection="multiple"
                    onGridReady={onGridReady}
                    onSelectionChanged={onSelectionChanged}
                />
            </div>
        </div>
    );
}
