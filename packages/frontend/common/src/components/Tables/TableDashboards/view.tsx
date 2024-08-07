import type { ISO, TimeZone } from '@common/types';
import { isNil } from 'lodash-es';
import type { ReactElement } from 'react';
import { useEffect } from 'react';

import type { TRobotDashboard } from '../../../modules/actions/def.ts';
import { ETableIds } from '../../../modules/clientTableFilters/data';
import type { TSocketName } from '../../../types/domain/sockets';
import { AgTableWithRouterSync } from '../../AgTable/AgTableWithRouterSync';
import { useFilteredData } from '../../AgTable/hooks/useFilteredData';
import { useGridApi } from '../../AgTable/hooks/useGridApi';
import { useRegExpTableFilter } from '../../AgTable/hooks/useRegExpTableFilter';
import { useRowSelection } from '../../AgTable/hooks/useRowSelection';
import { ExactDatePicker } from '../../ExactDatePicker';
import { TableLabelCount } from '../../TableLabel/Count';
import { TableLabel } from '../../TableLabel/TableLabel';
import { TableLabelRegExpFilter } from '../../TableLabel/TableLabelRegExpFilter';
import { TableLabels } from '../../TableLabel/TableLabels';
import { cnDatePicker, cnDatePickerTableLabel } from '../TableAllIndicators/style.css';
import { useDashboardsColumns } from './hooks';
import { cnIncreasedRowHeight } from './view.css';

type TableDashboardsProps = {
    socketName?: TSocketName;
    dashboards: TRobotDashboard[] | undefined;
    onDashboardLinkClick?: (url: string, name: string) => void;
    timeZone: TimeZone;
    snapshotDate?: ISO | undefined;
    onChangeSnapshotDate?: (value: ISO | undefined) => void;
};

export function TableDashboards(props: TableDashboardsProps): ReactElement {
    const columns = useDashboardsColumns(
        props.timeZone,
        props.socketName,
        props.snapshotDate,
        props.onDashboardLinkClick,
    );

    const { gridApi, onGridReady } = useGridApi<TRobotDashboard>();

    const {
        regExp,
        filterValid,
        templateExample,
        caseSensitive,
        setRegExp,
        toggleCaseSensitive,
        isExternalFilterPresent,
        doesExternalFilterPass,
    } = useRegExpTableFilter({
        tableId: ETableIds.Dashboards,
        columns,
        gridApi,
    });

    const { filteredCount } = useFilteredData(gridApi);
    const { onSelectionChanged } = useRowSelection<TRobotDashboard>();

    useEffect(() => {
        if (isNil(gridApi)) {
            return;
        }

        if (isNil(props.dashboards)) {
            gridApi.showLoadingOverlay();
        } else {
            gridApi.hideOverlay();
        }
    }, [gridApi, props.dashboards]);

    return (
        <>
            <TableLabels>
                <TableLabelRegExpFilter
                    inputPlaceholder={templateExample}
                    inputValue={regExp}
                    inputValid={filterValid}
                    onInputChange={setRegExp}
                    caseSensitive={caseSensitive}
                    onCaseSensitiveToggle={toggleCaseSensitive}
                />
                {!isNil(props.onChangeSnapshotDate) && (
                    <TableLabel className={cnDatePickerTableLabel}>
                        <ExactDatePicker
                            className={cnDatePicker}
                            size="small"
                            value={props.snapshotDate}
                            onChange={props.onChangeSnapshotDate}
                            timeZone={props.timeZone}
                        />
                    </TableLabel>
                )}
                <TableLabelCount
                    title="Dashboards"
                    count={props.dashboards?.length}
                    filteredCount={filteredCount}
                />
            </TableLabels>
            <AgTableWithRouterSync
                id={ETableIds.Dashboards}
                rowKey="id"
                rowData={props.dashboards}
                rowHeight={40}
                rowClass={cnIncreasedRowHeight}
                columnDefs={columns}
                rowSelection="multiple"
                onSelectionChanged={onSelectionChanged}
                onGridReady={onGridReady}
                isExternalFilterPresent={isExternalFilterPresent}
                doesExternalFilterPass={doesExternalFilterPass}
            />
        </>
    );
}
