import type { TimeZone } from '@common/types';
import type { RowClickedEvent } from '@frontend/ag-grid';
import { AgTableWithRouterSync } from '@frontend/common/src/components/AgTable/AgTableWithRouterSync';
import { useGridApi } from '@frontend/common/src/components/AgTable/hooks/useGridApi';
import { ETableIds } from '@frontend/common/src/modules/clientTableFilters/data';
import type { TWithClassname } from '@frontend/common/src/types/components';
import type { TBacktestingRun } from '@frontend/common/src/types/domain/backtestings';
import { useFunction } from '@frontend/common/src/utils/React/useFunction';
import cn from 'classnames';
import { isArray, isNil } from 'lodash-es';
import type { ReactElement } from 'react';
import { useEffect, useMemo } from 'react';

import type { TTableBacktestingRunsItem } from '../Layout/hooks/useBacktestingRunItems';
import { checkAllRunsInSingleGroup } from '../utils/runs';
import { getRowClassRules } from './grid';
import { useColumns } from './hooks/useColumns';
import { useGetContextMenuItems } from './hooks/useGetContextMenuItems';
import { cns } from './view.css';

export type TTableBacktestingRunsProps = TWithClassname & {
    items: TTableBacktestingRunsItem[];
    activeBacktestingId: undefined | TBacktestingRun['btRunNo'];
    onChangeActiveBacktestingId: (backtestingRunId: number) => void;
    onPause?: (id: TTableBacktestingRunsItem['btRunNo']) => unknown;
    onResume?: (id: TTableBacktestingRunsItem['btRunNo']) => unknown;
    scoreIndicatorsList: string[];
    timeZone: TimeZone;
};

export function TableBacktestingRuns(props: TTableBacktestingRunsProps): ReactElement {
    const { gridApi, onGridReady } = useGridApi();
    const getMenuItems = useGetContextMenuItems(props);
    const areAllRunsInSingleGroup = useMemo(() => {
        if (!isArray(props.items)) return true;
        return checkAllRunsInSingleGroup(props.items);
    }, [props.items]);

    const handleClickRow = useFunction((item: RowClickedEvent<TTableBacktestingRunsItem>) => {
        if (isNil(item.data)) {
            return;
        }
        props.onChangeActiveBacktestingId(item.data.btRunNo);
    });

    useEffect(() => {
        if (isNil(props.activeBacktestingId)) {
            return;
        }
        const node = gridApi?.getRowNode(String(props.activeBacktestingId));
        const selectedNodes = gridApi?.getSelectedNodes();
        if (isNil(selectedNodes) || selectedNodes[0] !== node) {
            node?.setSelected(true);
            gridApi?.ensureNodeVisible(node);
        }
    }, [gridApi, props.activeBacktestingId, props.items]);

    const rowClassRules = useMemo(() => getRowClassRules(), []);

    const columns = useColumns(props.scoreIndicatorsList, props.timeZone, !areAllRunsInSingleGroup);

    return (
        <div className={cn(cns.root, props.className)}>
            <AgTableWithRouterSync
                id={ETableIds.BacktestingRuns}
                rowKey="btRunNo"
                rowData={props.items}
                columnDefs={columns}
                asyncTransactionWaitMillis={1000}
                getContextMenuItems={getMenuItems}
                onRowClicked={handleClickRow}
                onGridReady={onGridReady}
                rowClassRules={rowClassRules}
                groupDefaultExpanded={1}
                suppressAnimationFrame={false}
            />
        </div>
    );
}
