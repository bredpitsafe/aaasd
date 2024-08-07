import type { TimeZone } from '@common/types';
import type { RowClassParams, RowClassRules, RowClickedEvent } from '@frontend/ag-grid';
import { AgTableWithRouterSync } from '@frontend/common/src/components/AgTable/AgTableWithRouterSync';
import { useGridApi } from '@frontend/common/src/components/AgTable/hooks/useGridApi';
import { ETableIds } from '@frontend/common/src/modules/clientTableFilters/data';
import type { TWithClassname } from '@frontend/common/src/types/components';
import type { TBacktestingRun } from '@frontend/common/src/types/domain/backtestings';
import { EBacktestingRunStatus } from '@frontend/common/src/types/domain/backtestings';
import { useFunction } from '@frontend/common/src/utils/React/useFunction';
import cn from 'classnames';
import { isArray, isNil } from 'lodash-es';
import type { ReactElement } from 'react';
import { useEffect, useMemo } from 'react';

import type { TTableBacktestingRunsItem } from '../Layout/hooks/useBacktestingRunItems';
import { checkAllRunsInSingleGroup } from '../utils/runs';
import { useColumns } from './hooks/useColumns';
import { cnFailedRow, cnRunningRow, cns, cnSucceedRow } from './view.css';

export type TTableBacktestingRunsInfoProps = TWithClassname & {
    variableNames: string[];
    runs: TTableBacktestingRunsItem[] | undefined;
    activeBacktestingId: undefined | TBacktestingRun['btRunNo'];
    onChangeActiveBacktestingId: (backtestingRunId: number) => void;
    scoreIndicatorsList: string[];
    timeZone: TimeZone;
};

export function TableBacktestingRunsInfo({
    className,
    variableNames,
    scoreIndicatorsList,
    runs,
    activeBacktestingId,
    onChangeActiveBacktestingId,
    timeZone,
}: TTableBacktestingRunsInfoProps): ReactElement {
    const rowClassRules = useMemo(() => getRowClassRules(), []);

    const areAllRunsInSingleGroup = useMemo(() => {
        if (!isArray(runs)) return true;
        return checkAllRunsInSingleGroup(runs);
    }, [runs]);
    const columns = useColumns(
        variableNames,
        scoreIndicatorsList,
        timeZone,
        !areAllRunsInSingleGroup,
    );

    const handleClickRow = useFunction((item: RowClickedEvent<TTableBacktestingRunsItem>) => {
        if (isNil(item.data)) {
            return;
        }
        onChangeActiveBacktestingId(item.data.btRunNo);
    });

    const { gridApi, onGridReady } = useGridApi();
    useEffect(() => {
        if (isNil(activeBacktestingId) || isNil(gridApi)) {
            return;
        }

        const node = gridApi.getRowNode(String(activeBacktestingId));
        if (isNil(node)) {
            return;
        }

        const selectedNodes = gridApi.getSelectedNodes();
        if (selectedNodes[0] !== node) {
            node?.setSelected(true);
            gridApi.ensureNodeVisible(node);
        }
    }, [gridApi, activeBacktestingId, runs]);

    return (
        <div className={cn(cns.root, className)}>
            <AgTableWithRouterSync<TTableBacktestingRunsItem>
                id={ETableIds.BacktestingRunsInfo}
                rowKey="btRunNo"
                rowData={runs}
                columnDefs={columns}
                suppressAnimationFrame={false}
                asyncTransactionWaitMillis={1000}
                rowClassRules={rowClassRules}
                groupDefaultExpanded={1}
                onRowClicked={handleClickRow}
                onGridReady={onGridReady}
            />
        </div>
    );
}

function getRowClassRules(): RowClassRules<TTableBacktestingRunsItem> {
    return {
        [cnRunningRow]: ({ data }: RowClassParams<TTableBacktestingRunsItem>) =>
            data?.status === EBacktestingRunStatus.Running,
        [cnFailedRow]: ({ data }: RowClassParams<TTableBacktestingRunsItem>) =>
            data?.status === EBacktestingRunStatus.Failed,
        [cnSucceedRow]: ({ data }: RowClassParams<TTableBacktestingRunsItem>) =>
            data?.status === EBacktestingRunStatus.Succeed,
    };
}
