import type { TimeZone } from '@common/types';
import type { ColDef, ValueFormatterParams, ValueGetterParams } from '@frontend/ag-grid';
import { jsonValueComparator } from '@frontend/ag-grid/src/comparators/jsonValueComparator';
import { isNil, isNumber, isPlainObject, isString } from 'lodash-es';
import { useMemo } from 'react';

import type { TTableBacktestingRunsItem } from '../../Layout/hooks/useBacktestingRunItems';
import {
    getBacktestingRunIdColumn,
    getElapsedTimeColumn,
    getEndTimeColumn,
    getProgressColumn,
    getRealStartTimeColumn,
    getRunScoreColumnPrefix,
    getRunScoreColumns,
    getSimulationEndTimeColumn,
    getSimulationStartTimeColumn,
    getSimulationTimeColumn,
    getSpeedColumn,
    getStatusColumn,
    getStatusReasonColumn,
} from '../../utils/runs';

export function useColumns(
    variableNames: string[],
    scoreIndicatorsList: string[],
    timeZone: TimeZone,
    isRunsGroupRequired: boolean,
): ColDef<TTableBacktestingRunsItem>[] {
    const columnKey = useMemo(
        () => getRunScoreColumnPrefix(scoreIndicatorsList),
        [scoreIndicatorsList],
    );

    const mainColumns = useMemo<ColDef<TTableBacktestingRunsItem>[]>(() => {
        const columns: ColDef<TTableBacktestingRunsItem>[] = [
            getBacktestingRunIdColumn({ colId: 'btRunNo_left', pinned: 'left' }),
            getStatusColumn({ colId: 'status_left', pinned: 'left', hide: true }),
            getStatusReasonColumn({ colId: 'statusReason_left', pinned: 'left', hide: true }),
            ...getRunScoreColumns<TTableBacktestingRunsItem>(scoreIndicatorsList, 'left'),
            getSpeedColumn({ colId: 'speed_left', pinned: 'left', hide: true }),
            getProgressColumn({ colId: 'progress_left', pinned: 'left', hide: true }),
            getSimulationStartTimeColumn({
                colId: 'simulationStartTime_left',
                pinned: 'left',
                hide: true,
                timeZone,
            }),
            getSimulationEndTimeColumn({
                colId: 'simulationEndTime_left',
                pinned: 'left',
                timeZone,
            }),
            getSimulationTimeColumn({ colId: 'simulationTime_left', pinned: 'left', timeZone }),
            getRealStartTimeColumn({
                colId: 'realStartTime_left',
                pinned: 'left',
                hide: true,
                timeZone,
            }),
            getElapsedTimeColumn({
                colId: 'elapsedTime_left',
                pinned: 'left',
                hide: true,
                timeZone,
            }),
            getEndTimeColumn({ colId: 'endTime_left', pinned: 'left', hide: true, timeZone }),
        ];

        if (isRunsGroupRequired) {
            columns.push({
                colId: 'group_left',
                field: 'group',
                headerName: 'Group',
                hide: true,
                rowGroup: true,
                pinned: 'left',
                width: 150,
            });
        }

        return columns;
    }, [timeZone, isRunsGroupRequired, scoreIndicatorsList]);

    const generatedColumns = useMemo<ColDef<TTableBacktestingRunsItem>[]>(() => {
        const uniqRenderKey = Date.now();
        return variableNames.map(
            (key): ColDef<TTableBacktestingRunsItem> => ({
                // Ag-Grid tries to merge columns and looses columns position, new IDs are required when column changes
                colId: `DYNAMIC-COLUMN-${uniqRenderKey}-${key}`,
                headerName: key,
                valueGetter: variableValueGetterFactory(key),
                valueFormatter: variableValueFormatter,
                comparator: jsonValueComparator,
                minWidth: 80,
            }),
        );
    }, [variableNames]);

    return useMemo(
        () =>
            [...mainColumns, ...generatedColumns].map((column) => ({
                ...column,
                colId: `${columnKey} - ${column.colId ?? column.field}`,
            })),
        [mainColumns, generatedColumns, columnKey],
    );
}

function variableValueGetterFactory(variableKey: string) {
    return (params: ValueGetterParams<TTableBacktestingRunsItem>) =>
        params.data?.variables?.[variableKey];
}

function variableValueFormatter(params: ValueFormatterParams<TTableBacktestingRunsItem>) {
    if (isNil(params.value)) {
        return '—';
    }

    if (isString(params.value) || isNumber(params.value)) {
        return params.value;
    }

    if (isPlainObject(params.value)) {
        return JSON.stringify(params.value);
    }

    return params.value;
}
