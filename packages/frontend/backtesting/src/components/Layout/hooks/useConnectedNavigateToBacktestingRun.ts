import type { Nil } from '@common/types';
import { useModule } from '@frontend/common/src/di/react';
import type { TBacktestingTask } from '@frontend/common/src/types/domain/backtestings';
import type { TSocketName } from '@frontend/common/src/types/domain/sockets';
import { useFunction } from '@frontend/common/src/utils/React/useFunction';
import { isNil } from 'lodash-es';

import { ModuleNavigateToBacktestingRun } from '../../../modules/actions/ModuleNavigateToBacktestingRun';

export function useConnectedNavigateToBacktestingRun(
    socketName: Nil | TSocketName,
    task: Nil | TBacktestingTask,
) {
    const navigateToBacktestingRun = useModule(ModuleNavigateToBacktestingRun);

    return useFunction((backtestingRunId: number) => {
        if (isNil(task) || isNil(socketName)) {
            return;
        }

        void navigateToBacktestingRun(socketName, task.id, backtestingRunId);
    });
}
