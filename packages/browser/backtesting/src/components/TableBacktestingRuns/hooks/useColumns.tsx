import { createTestProps } from '@frontend/common/e2e';
import { EDashboardsTabSelectors } from '@frontend/common/e2e/selectors/trading-servers-manager/components/dashboards-tab/dashboards.tab.selectors';
import { getTimeColumn } from '@frontend/common/src/components/AgTable/columns/getTimeColumn';
import { withReadOnlyEditor } from '@frontend/common/src/components/AgTable/editors/ReadOnlyEditor';
import { dateFormatter } from '@frontend/common/src/components/AgTable/formatters/date';
import { UrlRenderer } from '@frontend/common/src/components/AgTable/renderers/UrlRenderer';
import { EColumnFilterType, TColDef } from '@frontend/common/src/components/AgTable/types';
import { isGroupRow } from '@frontend/common/src/components/AgTable/utils';
import { EDateTimeFormats, TimeZone } from '@frontend/common/src/types/time';
import { getTradingStatsDailyURL } from '@frontend/common/src/utils/urlBuilders';
import type { ICellRendererParams } from 'ag-grid-community';
import { isNil } from 'lodash-es';
import { useMemo } from 'react';
import { sprintf } from 'sprintf-js';

import type { TTableBacktestingRunsItem } from '../../Layout/hooks/useBacktestingRunItems';
import { getRunScoreColumnPrefix, getRunScoreColumns } from '../../utils/runs';

const SPEED_FORMAT = '%.2f';
const PROGRESS_FORMAT = '%.2f';

export function useColumns(
    scoreIndicatorsList: string[],
    timeZone: TimeZone,
    isRunsGroupRequired: boolean,
): TColDef<TTableBacktestingRunsItem>[] {
    return useMemo(() => {
        const columnKey = getRunScoreColumnPrefix(scoreIndicatorsList);

        const columns: TColDef<TTableBacktestingRunsItem>[] = [
            {
                field: 'btRunNo',
                headerName: 'ID',
                filter: EColumnFilterType.number,
                enableValue: true,
                aggFunc: 'count',
            },
            {
                field: 'status',
                headerName: 'Status',
                filter: EColumnFilterType.text,
            },
            {
                field: 'statusReason',
                headerName: 'Status Reason',
                filter: EColumnFilterType.text,
                suppressAutoSize: true,
                tooltipField: 'statusReason',
                ...withReadOnlyEditor(),
            },
            ...getRunScoreColumns<TTableBacktestingRunsItem>(scoreIndicatorsList),
            {
                field: 'speed',
                headerName: 'Speed',
                tooltipValueGetter: () => 'Multiplier for speed time during Run',
                valueFormatter: ({ value, node }) => {
                    if (isNil(node) || isGroupRow(node)) return '';
                    return isFinite(value) ? sprintf(SPEED_FORMAT, value) : '-';
                },
                filter: EColumnFilterType.number,
            },
            {
                field: 'progress',
                headerName: 'Progress',
                valueFormatter: ({ value, node }) => {
                    if (isNil(node) || isGroupRow(node)) return '';
                    return isFinite(value) ? `${sprintf(PROGRESS_FORMAT, value)}%` : '-';
                },
                filter: EColumnFilterType.number,
            },
            {
                ...getTimeColumn<TTableBacktestingRunsItem>(
                    'simulationStartTime',
                    'Sim. Start Time (UTC)',
                    timeZone,
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
                    isNil(params.data?.simulationStartTime)
                        ? undefined
                        : 'Open Trading Stats for this run',
                filter: false,
            },
            {
                ...getTimeColumn<TTableBacktestingRunsItem>(
                    'simulationEndTime',
                    'Sim. End Time (UTC)',
                    timeZone,
                ),
                filter: false,
            },
            {
                ...getTimeColumn<TTableBacktestingRunsItem>(
                    'simulationTime',
                    'Sim. Current Time (UTC)',
                    timeZone,
                ),
                filter: false,
            },
            {
                ...getTimeColumn<TTableBacktestingRunsItem>(
                    'realStartTime',
                    'Start Time',
                    timeZone,
                ),
                filter: false,
            },
            {
                ...getTimeColumn<TTableBacktestingRunsItem>('elapsedTime', 'Run Time', timeZone),
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
                filter: false,
            },
            {
                headerName: 'Build',
                field: 'buildInfo',
                cellRenderer: (params: ICellRendererParams<TTableBacktestingRunsItem>) => {
                    const buildInfo = params.data?.buildInfo;

                    if (isNil(buildInfo)) {
                        return '—';
                    }
                    return (
                        <div>
                            <span>
                                build: <b>{buildInfo.core?.buildId ?? '-'}</b>
                            </span>
                            ,{' '}
                            <span>
                                commit: <b>{buildInfo.core?.commit ?? '-'}</b>
                            </span>
                            ,{' '}
                            <span>
                                version: <b>{buildInfo.core?.version ?? '-'}</b>
                            </span>
                            ,{' '}
                            <span>
                                node: <b>{buildInfo.nodeNo}</b>
                            </span>
                            ,{' '}
                            <span>
                                launch: <b>{buildInfo.launchNo}</b>
                            </span>
                        </div>
                    );
                },
                tooltipValueGetter: (params) => {
                    return params.data?.buildInfo
                        ? `node: ${params.data.buildInfo.nodeNo},
launch: ${params.data.buildInfo.launchNo},
build: ${params.data.buildInfo?.core?.buildId ?? '-'},
commit: ${params.data.buildInfo?.core?.commit ?? '-'},
version: ${params.data.buildInfo?.core?.version ?? '-'}`
                        : null;
                },
                ...withReadOnlyEditor(),
            },
        ];

        if (isRunsGroupRequired) {
            columns.unshift({
                field: 'group',
                hide: true,
                rowGroup: true,
            });
        }

        return columns.map((column) => ({
            ...column,
            colId: `${columnKey} - ${column.colId ?? column.field}`,
        }));
    }, [scoreIndicatorsList, timeZone, isRunsGroupRequired]);
}
