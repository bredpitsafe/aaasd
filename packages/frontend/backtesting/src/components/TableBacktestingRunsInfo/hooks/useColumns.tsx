import type { ColDef, ValueFormatterParams, ValueGetterParams } from '@frontend/ag-grid';
import { jsonValueComparator } from '@frontend/ag-grid/src/comparators/jsonValueComparator';
import { EColumnFilterType } from '@frontend/ag-grid/src/types';
import { getTimeColumn } from '@frontend/common/src/components/AgTable/columns/getTimeColumn';
import { dateFormatter } from '@frontend/common/src/components/AgTable/formatters/date';
import { EDateTimeFormats, TimeZone } from '@frontend/common/src/types/time';
import { isNil, isNumber, isPlainObject, isString } from 'lodash-es';
import { useMemo } from 'react';

import type { TTableBacktestingRunsItem } from '../../Layout/hooks/useBacktestingRunItems';
import { getRunScoreColumnPrefix, getRunScoreColumns } from '../../utils/runs';

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
            {
                colId: 'btRunNo_left',
                field: 'btRunNo',
                headerName: 'ID',
                filter: EColumnFilterType.number,
                pinned: 'left',
                enableValue: true,
                aggFunc: 'count',
            },
            ...getRunScoreColumns<TTableBacktestingRunsItem>(scoreIndicatorsList, 'left'),
            {
                ...getTimeColumn<TTableBacktestingRunsItem>(
                    'simulationEndTime',
                    'Sim. End Time (UTC)',
                    timeZone,
                ),
                colId: 'simulationEndTime_left',
                pinned: 'left',
                filter: false,
            },
            {
                ...getTimeColumn<TTableBacktestingRunsItem>(
                    'simulationTime',
                    'Sim. Current Time (UTC)',
                    timeZone,
                ),
                colId: 'simulationTime_left',
                pinned: 'left',
                filter: false,
            },
            {
                ...getTimeColumn<TTableBacktestingRunsItem>(
                    'realStartTime',
                    'Start Time',
                    timeZone,
                ),
                pinned: 'left',
                hide: true,
                filter: false,
            },
            {
                ...getTimeColumn<TTableBacktestingRunsItem>('elapsedTime', 'Run Time', timeZone),
                pinned: 'left',
                hide: true,
                valueFormatter: dateFormatter(timeZone, EDateTimeFormats.Time),
                filter: false,
            },
            {
                ...getTimeColumn<TTableBacktestingRunsItem>(
                    'endTime',
                    'Approximate End Time',
                    timeZone,
                ),
                pinned: 'left',
                hide: true,
            },
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
