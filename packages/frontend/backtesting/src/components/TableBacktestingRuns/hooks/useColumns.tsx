import type { TimeZone } from '@common/types';
import type { ICellRendererParams } from '@frontend/ag-grid';
import type { TColDef } from '@frontend/ag-grid/src/types';
import { withReadOnlyEditor } from '@frontend/common/src/components/AgTable/editors/ReadOnlyEditor';
import { isNil } from 'lodash-es';
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
    scoreIndicatorsList: string[],
    timeZone: TimeZone,
    isRunsGroupRequired: boolean,
): TColDef<TTableBacktestingRunsItem>[] {
    return useMemo(() => {
        const columnKey = getRunScoreColumnPrefix(scoreIndicatorsList);

        const columns: TColDef<TTableBacktestingRunsItem>[] = [
            getBacktestingRunIdColumn(),
            getStatusColumn(),
            getStatusReasonColumn(),
            ...getRunScoreColumns<TTableBacktestingRunsItem>(scoreIndicatorsList),
            getSpeedColumn(),
            getProgressColumn(),
            getSimulationStartTimeColumn({ timeZone }),
            getSimulationEndTimeColumn({ timeZone }),
            getSimulationTimeColumn({ timeZone }),
            getRealStartTimeColumn({ timeZone }),
            getElapsedTimeColumn({ hide: true, timeZone }),
            getEndTimeColumn({ timeZone }),
            {
                headerName: 'Build',
                field: 'buildInfo',
                cellRenderer: (
                    params: ICellRendererParams<TTableBacktestingRunsItem['buildInfo']>,
                ) => {
                    const buildInfo = params.value;

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
                        ? `node: ${params.data.buildInfo.nodeNo},\n` +
                              `launch: ${params.data.buildInfo.launchNo},\n` +
                              `build: ${params.data.buildInfo?.core?.buildId ?? '-'},\n` +
                              `commit: ${params.data.buildInfo?.core?.commit ?? '-'},\n` +
                              `version: ${params.data.buildInfo?.core?.version ?? '-'}`
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
