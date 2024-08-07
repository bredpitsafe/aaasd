import type { Nil, TimeZone } from '@common/types';
import { EDateTimeFormats } from '@common/types';
import type {
    ColDef,
    ValueFormatterFunc,
    ValueFormatterParams,
    ValueGetterFunc,
} from '@frontend/ag-grid';
import { DATE_TIME_COL_SIZE, TIME_COL_SIZE } from '@frontend/ag-grid/src/defs.ts';
import { EColumnFilterType } from '@frontend/ag-grid/src/types';
import { createTestProps } from '@frontend/common/e2e';
import { EDashboardsTabSelectors } from '@frontend/common/e2e/selectors/trading-servers-manager/components/dashboards-tab/dashboards.tab.selectors';
import { getTimeColumn } from '@frontend/common/src/components/AgTable/columns/getTimeColumn.ts';
import { withReadOnlyEditor } from '@frontend/common/src/components/AgTable/editors/ReadOnlyEditor.tsx';
import { dateFormatter } from '@frontend/common/src/components/AgTable/formatters/date.ts';
import { UrlRenderer } from '@frontend/common/src/components/AgTable/renderers/UrlRenderer.tsx';
import { isGroupRow } from '@frontend/common/src/components/AgTable/utils.ts';
import type { TIndicator } from '@frontend/common/src/modules/actions/indicators/defs';
import type { TBacktestingRun } from '@frontend/common/src/types/domain/backtestings';
import { getTradingStatsDailyURL } from '@frontend/common/src/utils/urlBuilders.ts';
import { isNil, isNull, isUndefined } from 'lodash-es';
import { sprintf } from 'sprintf-js';

import type { TTableBacktestingRunsItem } from '../Layout/hooks/useBacktestingRunItems.ts';

const SPEED_FORMAT = '%.2f';
const PROGRESS_FORMAT = '%.2f';

export function checkAllRunsInSingleGroup(runs: TBacktestingRun[]): boolean {
    const firstRun = runs.at(0);
    if (isUndefined(firstRun)) return true;
    for (const run of runs) {
        if (run.group !== firstRun.group) return false;
    }
    return true;
}

export function getRunScoreColumnPrefix(scoreIndicatorsList: string[]): string {
    return `score-cols-${Math.max(1, scoreIndicatorsList.length)}`;
}

function getScoreValueGetter<T extends { scores: Nil | Record<TIndicator['name'], Nil | number> }>(
    scoreIndicatorName: Nil | string,
): ValueGetterFunc<T> {
    return isNil(scoreIndicatorName)
        ? () => undefined
        : ({ data }) => data?.scores?.[scoreIndicatorName];
}

function getScoreValueFormatter<
    T extends { scores: Nil | Record<TIndicator['name'], Nil | number> },
>() {
    return (({ value }: ValueFormatterParams<T, Nil | number>) =>
        isNull(value) ? 'null' : value) as ValueFormatterFunc<T, Nil | number>;
}

export function getRunScoreColumns<
    T extends { scores: Nil | Record<TIndicator['name'], Nil | number> },
>(scoreIndicatorsList: string[], pinned?: ColDef<T>['pinned']): ColDef<T>[] {
    return scoreIndicatorsList.length <= 1
        ? [
              {
                  colId: `score_0_${pinned ?? ''}`,
                  headerName: 'Score',
                  filter: EColumnFilterType.number,
                  enableValue: true,
                  aggFunc: 'sum',
                  valueGetter: getScoreValueGetter(scoreIndicatorsList?.[0]),
                  valueFormatter: getScoreValueFormatter(),
                  pinned,
              },
          ]
        : scoreIndicatorsList.map((scoreIndicatorName, index) => ({
              colId: `score_${index}_${pinned ?? ''}`,
              headerName: scoreIndicatorName,
              filter: EColumnFilterType.number,
              enableValue: true,
              aggFunc: 'sum',
              valueGetter: getScoreValueGetter(scoreIndicatorName),
              valueFormatter: getScoreValueFormatter(),
              pinned,
          }));
}

export function getBacktestingRunIdColumn(
    props?: Pick<ColDef<TTableBacktestingRunsItem>, 'colId' | 'pinned' | 'hide'>,
): ColDef<TTableBacktestingRunsItem> {
    return {
        colId: props?.colId,
        pinned: props?.pinned,
        hide: props?.hide,
        field: 'btRunNo',
        headerName: 'ID',
        filter: EColumnFilterType.number,
        enableValue: true,
        aggFunc: 'count',
    };
}

export function getStatusColumn(
    props?: Pick<ColDef<TTableBacktestingRunsItem>, 'colId' | 'pinned' | 'hide'>,
): ColDef<TTableBacktestingRunsItem> {
    return {
        colId: props?.colId,
        pinned: props?.pinned,
        hide: props?.hide,
        field: 'status',
        headerName: 'Status',
        filter: EColumnFilterType.text,
        minWidth: 125,
        maxWidth: 125,
        resizable: false,
    };
}

export function getStatusReasonColumn(
    props?: Pick<ColDef<TTableBacktestingRunsItem>, 'colId' | 'pinned' | 'hide'>,
): ColDef<TTableBacktestingRunsItem> {
    return {
        colId: props?.colId,
        pinned: props?.pinned,
        hide: props?.hide,
        field: 'statusReason',
        headerName: 'Status Reason',
        filter: EColumnFilterType.text,
        suppressAutoSize: true,
        tooltipField: 'statusReason',
        ...withReadOnlyEditor(),
        minWidth: 130,
    };
}

export function getSpeedColumn(
    props?: Pick<ColDef<TTableBacktestingRunsItem>, 'colId' | 'pinned' | 'hide'>,
): ColDef<TTableBacktestingRunsItem> {
    return {
        colId: props?.colId,
        pinned: props?.pinned,
        hide: props?.hide,
        field: 'speed',
        headerName: 'Speed',
        tooltipValueGetter: () => 'Multiplier for speed time during Run',
        valueFormatter: ({ value, node }) => {
            if (isNil(node) || isGroupRow(node)) return '';
            return isFinite(value) ? sprintf(SPEED_FORMAT, value) : '-';
        },
        filter: EColumnFilterType.number,
    };
}

export function getProgressColumn(
    props?: Pick<ColDef<TTableBacktestingRunsItem>, 'colId' | 'pinned' | 'hide'>,
): ColDef<TTableBacktestingRunsItem> {
    return {
        colId: props?.colId,
        pinned: props?.pinned,
        hide: props?.hide,
        field: 'progress',
        headerName: 'Progress',
        valueFormatter: ({ value, node }) => {
            if (isNil(node) || isGroupRow(node)) return '';
            return isFinite(value) ? `${sprintf(PROGRESS_FORMAT, value)}%` : '-';
        },
        filter: EColumnFilterType.number,
        minWidth: 80,
        maxWidth: 95,
    };
}

export function getSimulationStartTimeColumn(
    props: Partial<Pick<ColDef<TTableBacktestingRunsItem>, 'colId' | 'pinned' | 'hide'>> & {
        timeZone: TimeZone;
    },
): ColDef<TTableBacktestingRunsItem> {
    return {
        colId: props?.colId,
        pinned: props?.pinned,
        hide: props?.hide,
        ...getTimeColumn<TTableBacktestingRunsItem>(
            'simulationStartTime',
            'Sim. Start Time',
            props.timeZone,
        ),
        cellRendererSelector: (params) => ({
            params: {
                url:
                    isNil(params.data?.socket) || isNil(params.data?.simulationStartTime)
                        ? undefined
                        : getTradingStatsDailyURL(
                              params.data!.socket,
                              params.data.simulationStartTime,
                              params.data.simulationEndTime,
                              params.data?.btRunNo,
                          ),
                text: params.valueFormatted,
                ...createTestProps(EDashboardsTabSelectors.DashboardLink),
            },
            component: UrlRenderer,
        }),
        tooltipValueGetter: (params) =>
            isNil(params.data?.simulationStartTime) ? undefined : 'Open Trading Stats for this run',
        filter: false,
        ...DATE_TIME_COL_SIZE,
    };
}

export function getSimulationEndTimeColumn(
    props: Partial<Pick<ColDef<TTableBacktestingRunsItem>, 'colId' | 'pinned' | 'hide'>> & {
        timeZone: TimeZone;
    },
): ColDef<TTableBacktestingRunsItem> {
    return {
        colId: props?.colId,
        pinned: props?.pinned,
        hide: props?.hide,
        ...getTimeColumn<TTableBacktestingRunsItem>(
            'simulationEndTime',
            'Sim. End Time',
            props.timeZone,
        ),
        filter: false,
        ...DATE_TIME_COL_SIZE,
    };
}

export function getSimulationTimeColumn(
    props: Partial<Pick<ColDef<TTableBacktestingRunsItem>, 'colId' | 'pinned' | 'hide'>> & {
        timeZone: TimeZone;
    },
): ColDef<TTableBacktestingRunsItem> {
    return {
        colId: props?.colId,
        pinned: props?.pinned,
        hide: props?.hide,
        ...getTimeColumn<TTableBacktestingRunsItem>(
            'simulationTime',
            'Sim. Current Time',
            props.timeZone,
        ),
        filter: false,
        ...DATE_TIME_COL_SIZE,
    };
}

export function getRealStartTimeColumn(
    props: Partial<Pick<ColDef<TTableBacktestingRunsItem>, 'colId' | 'pinned' | 'hide'>> & {
        timeZone: TimeZone;
    },
): ColDef<TTableBacktestingRunsItem> {
    return {
        colId: props?.colId,
        pinned: props?.pinned,
        hide: props?.hide,
        ...getTimeColumn<TTableBacktestingRunsItem>('realStartTime', 'Start Time', props.timeZone),
        filter: false,
        ...DATE_TIME_COL_SIZE,
    };
}

export function getElapsedTimeColumn(
    props: Partial<Pick<ColDef<TTableBacktestingRunsItem>, 'colId' | 'pinned' | 'hide'>> & {
        timeZone: TimeZone;
    },
): ColDef<TTableBacktestingRunsItem> {
    return {
        colId: props?.colId,
        pinned: props?.pinned,
        hide: props?.hide,
        ...getTimeColumn<TTableBacktestingRunsItem>('elapsedTime', 'Run Time', props.timeZone),
        valueFormatter: dateFormatter(props.timeZone, EDateTimeFormats.Time),
        filter: false,
        ...TIME_COL_SIZE,
    };
}

export function getEndTimeColumn(
    props: Partial<Pick<ColDef<TTableBacktestingRunsItem>, 'colId' | 'pinned' | 'hide'>> & {
        timeZone: TimeZone;
    },
): ColDef<TTableBacktestingRunsItem> {
    return {
        colId: props?.colId,
        pinned: props?.pinned,
        hide: props?.hide,
        ...getTimeColumn<TTableBacktestingRunsItem>(
            'endTime',
            'Approximate End Time',
            props.timeZone,
        ),
        filter: false,
        ...DATE_TIME_COL_SIZE,
    };
}
