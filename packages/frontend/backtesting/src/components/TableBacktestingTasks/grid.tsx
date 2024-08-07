import type { RowClassParams, RowClassRules } from '@frontend/ag-grid';
import { Link } from '@frontend/common/src/components/Link';
import { Tooltip } from '@frontend/common/src/components/Tooltip';
import {
    EBacktestingRunStatus,
    EBacktestingTaskStatus,
} from '@frontend/common/src/types/domain/backtestings';
import cn from 'classnames';
import { isEmpty, isNil } from 'lodash-es';
import { memo } from 'react';

import { EBacktestingRoute } from '../../defs/router';
import type { TTableBacktestingTasksItem } from './view';
import {
    cnBadgeColor,
    cnFailedRow,
    cnRunningRow,
    cnRunStatusContainer,
    cnSucceedRow,
} from './view.css';

const runStatusesOrder = [
    EBacktestingRunStatus.Initializing,
    EBacktestingRunStatus.Running,
    EBacktestingRunStatus.Paused,
    EBacktestingRunStatus.Succeed,
    EBacktestingRunStatus.Stopped,
    EBacktestingRunStatus.Failed,
];

function hasStatus(
    runsStatus: TTableBacktestingTasksItem['runsStatus'],
    status: EBacktestingRunStatus,
) {
    return !isNil(runsStatus) && runsStatus.findIndex(([s]) => s === status) !== -1;
}

function getStatusCount(
    runsStatus: [EBacktestingRunStatus, number][],
    status: EBacktestingRunStatus,
) {
    return runsStatus.find(([s]) => s === status)?.[1] ?? 0;
}

export function getRowClassRules(): RowClassRules<TTableBacktestingTasksItem> {
    return {
        [cnRunningRow]: ({ data }: RowClassParams<TTableBacktestingTasksItem>) =>
            data?.status === EBacktestingTaskStatus.Running,
        [cnFailedRow]: ({ data }: RowClassParams<TTableBacktestingTasksItem>) =>
            !isNil(data) &&
            data.status !== EBacktestingTaskStatus.Running &&
            !isEmpty(data.runsStatus) &&
            hasStatus(data.runsStatus, EBacktestingRunStatus.Failed),
        [cnSucceedRow]: ({ data }: RowClassParams<TTableBacktestingTasksItem>) =>
            data?.status === EBacktestingTaskStatus.Finished &&
            !isEmpty(data.runsStatus) &&
            !hasStatus(data.runsStatus, EBacktestingRunStatus.Failed) &&
            hasStatus(data.runsStatus, EBacktestingRunStatus.Succeed),
    };
}

export function RunsStatusView({ data }: RowClassParams<TTableBacktestingTasksItem>) {
    const runsStatus = data?.runsStatus;

    if (isNil(data) || isNil(runsStatus)) {
        return null;
    }

    return (
        <div>
            {runStatusesOrder.map((status) => (
                <StatusBadge
                    key={String(status)}
                    status={status}
                    count={getStatusCount(runsStatus, status)}
                />
            ))}
        </div>
    );
}

export function RunsRangeView({ data }: RowClassParams<TTableBacktestingTasksItem>) {
    if (isNil(data)) {
        return null;
    }

    const showMinRunNo = !isNil(data.minBtRunNo);
    const showMaxRunNo = !isNil(data.maxBtRunNo) && data.minBtRunNo !== data.maxBtRunNo;
    if (!showMinRunNo && !showMaxRunNo) {
        return null;
    }

    return (
        <>
            {showMinRunNo ? (
                <Link
                    routeName={EBacktestingRoute.Backtesting}
                    routeParams={{
                        backtestingTaskId: data.id,
                        backtestingRunId: data.minBtRunNo,
                    }}
                    preserveParams
                >
                    {data.minBtRunNo}
                </Link>
            ) : null}
            {showMaxRunNo ? (
                <>
                    {' — '}
                    <Link
                        routeName={EBacktestingRoute.Backtesting}
                        routeParams={{
                            backtestingTaskId: data.id,
                            backtestingRunId: data.maxBtRunNo,
                        }}
                        preserveParams
                    >
                        {data.maxBtRunNo}
                    </Link>
                </>
            ) : null}
        </>
    );
}

const StatusBadge = memo(({ status, count }: { status: EBacktestingRunStatus; count: number }) => {
    if (count === 0) {
        return null;
    }

    return (
        <Tooltip title={`${count} ${status.toLocaleLowerCase()} task${count > 1 ? 's' : ''}`}>
            <div key={status} className={cn(cnRunStatusContainer, cnBadgeColor[status])}>
                {count}
            </div>
        </Tooltip>
    );
});
