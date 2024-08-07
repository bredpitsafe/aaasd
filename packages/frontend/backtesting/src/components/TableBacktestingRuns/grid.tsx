import type { RowClassParams, RowClassRules } from '@frontend/ag-grid';
import { EBacktestingRunStatus } from '@frontend/common/src/types/domain/backtestings';

import type { TTableBacktestingRunsItem } from '../Layout/hooks/useBacktestingRunItems';
import { cnFailedRow, cnRunningRow, cnSucceedRow } from './view.css';

export function getRowClassRules(): RowClassRules<TTableBacktestingRunsItem> {
    return {
        [cnRunningRow]: ({ data }: RowClassParams<TTableBacktestingRunsItem>) =>
            data?.status === EBacktestingRunStatus.Running,
        [cnFailedRow]: ({ data }: RowClassParams<TTableBacktestingRunsItem>) =>
            data?.status === EBacktestingRunStatus.Failed,
        [cnSucceedRow]: ({ data }: RowClassParams<TTableBacktestingRunsItem>) =>
            data?.status === EBacktestingRunStatus.Succeed,
    };
}
