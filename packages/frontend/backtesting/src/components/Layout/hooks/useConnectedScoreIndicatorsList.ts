import type { TraceId } from '@common/utils';
import { useModule } from '@frontend/common/src/di/react';
import type { TIndicator } from '@frontend/common/src/modules/actions/indicators/defs';
import { ModuleSocketPage } from '@frontend/common/src/modules/socketPage';
import { EMPTY_ARRAY } from '@frontend/common/src/utils/const';
import { useNotifiedObservableFunction } from '@frontend/common/src/utils/React/useObservableFunction';
import { useSyncObservable } from '@frontend/common/src/utils/React/useSyncObservable';
import { useSyncState } from '@frontend/common/src/utils/React/useSyncState';
import type { TComponentValueDescriptor } from '@frontend/common/src/utils/React/useValueDescriptorObservable';
import { useNotifiedValueDescriptorObservable } from '@frontend/common/src/utils/React/useValueDescriptorObservable';
import { isNil } from 'lodash-es';
import { EMPTY } from 'rxjs';

import { ModuleSubscribeToCurrentBacktestingTask } from '../../../modules/actions/ModuleSubscribeToCurrentBacktestingTask';
import { ModuleUpdateBacktestingTask } from '../../../modules/actions/ModuleUpdateBacktestingTask';
import { indicatorsListToIndicator, indicatorToIndicatorsList } from '../../../utils/indicators';

export function useConnectedScoreIndicatorsList(traceId: TraceId): {
    scoreIndicatorsList: string[];
    setScoreIndicatorsList: (value: string[]) => void;
    updateScoreIndicatorsListInTask: (scoreIndicator: string[]) => unknown;
    descriptors: TComponentValueDescriptor<unknown>[];
} {
    const { currentSocketUrl$ } = useModule(ModuleSocketPage);
    const subscribeToCurrentBacktestingTask = useModule(ModuleSubscribeToCurrentBacktestingTask);

    const task = useNotifiedValueDescriptorObservable(subscribeToCurrentBacktestingTask(traceId));
    const socketUrl = useSyncObservable(currentSocketUrl$);
    const updateBacktestingTask = useModule(ModuleUpdateBacktestingTask);

    const [scoreIndicatorsList, setScoreIndicatorsList] = useSyncState<TIndicator['name'][]>(
        indicatorToIndicatorsList(task?.value?.scoreIndicator ?? null) ?? EMPTY_ARRAY,
        [task?.value?.scoreIndicator],
    );

    const [updateScoreIndicatorsListInTask] = useNotifiedObservableFunction(
        (scoreIndicatorsList: string[]) => {
            const value = task?.value;

            if (isNil(socketUrl) || isNil(value)) {
                return EMPTY;
            }

            const newTask = {
                ...value,
                scoreIndicator: indicatorsListToIndicator(scoreIndicatorsList) ?? null,
            };

            return updateBacktestingTask({ target: socketUrl, ...newTask }, { traceId });
        },
        {
            getNotifyTitle: () => `Update score indicators list`,
        },
    );

    return {
        scoreIndicatorsList,
        setScoreIndicatorsList,
        updateScoreIndicatorsListInTask,
        descriptors: [task],
    };
}
