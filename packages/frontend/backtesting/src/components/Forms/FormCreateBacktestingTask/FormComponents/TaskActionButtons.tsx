import { CopyOutlined, DeleteOutlined, RetweetOutlined, StopOutlined } from '@ant-design/icons';
import {
    DetailsTabProps,
    EDetailsTabSelectors,
} from '@frontend/common/e2e/selectors/backtesting/components/details-tab/details.tab.selectors';
import { Button } from '@frontend/common/src/components/Button';
import { Space } from '@frontend/common/src/components/Space';
import type { TBacktestingTask } from '@frontend/common/src/types/domain/backtestings';
import { EBacktestingTaskStatus } from '@frontend/common/src/types/domain/backtestings';
import { useFunction } from '@frontend/common/src/utils/React/useFunction';
import { isNil } from 'lodash-es';
import type { ReactElement } from 'react';

import { useTaskActions } from '../../../../hooks/useTaskActions';
import { cnServerSelectorContainer } from '../view.css';

type TTaskActionButtonsProps = Partial<Pick<TBacktestingTask, 'id' | 'status'>>;

export function TaskActionButtons(props: TTaskActionButtonsProps): ReactElement {
    const { id, status } = props;
    const { stopTask, cloneTask, deleteTask, runAgainTask } = useTaskActions();

    const cbStopTask = useFunction(() => !isNil(id) && stopTask(id));
    const cbCloneTask = useFunction(() => !isNil(id) && cloneTask(id));
    const cbDeleteTask = useFunction(() => !isNil(id) && deleteTask(id));
    const cbRunAgainTask = useFunction(() => !isNil(id) && runAgainTask(id));

    return (
        <Space.Compact className={cnServerSelectorContainer} block size="small">
            <Button
                {...DetailsTabProps[EDetailsTabSelectors.StopTaskButton]}
                type="primary"
                icon={<StopOutlined />}
                title="Stop task"
                disabled={
                    status !== EBacktestingTaskStatus.Running &&
                    status !== EBacktestingTaskStatus.Queued
                }
                onClick={cbStopTask}
            />
            <Button
                {...DetailsTabProps[EDetailsTabSelectors.RunAgainTaskButton]}
                type="dashed"
                icon={<RetweetOutlined />}
                size="small"
                title="Run task again"
                onClick={cbRunAgainTask}
            />
            <Button
                {...DetailsTabProps[EDetailsTabSelectors.CloneTaskButton]}
                icon={<CopyOutlined />}
                size="small"
                title="Clone task"
                onClick={cbCloneTask}
            />
            <Button
                {...DetailsTabProps[EDetailsTabSelectors.DeleteTaskButton]}
                danger
                icon={<DeleteOutlined />}
                size="small"
                title="Delete task"
                onClick={cbDeleteTask}
            />
        </Space.Compact>
    );
}
