import { ModuleFactory } from '@frontend/common/src/di';
import { ModuleSocketPage } from '@frontend/common/src/modules/socketPage';
import type { TBacktestingTask } from '@frontend/common/src/types/domain/backtestings';
import type { TSocketName } from '@frontend/common/src/types/domain/sockets';
import { combineLatest, first, switchMap } from 'rxjs';

import { EBacktestingRoute } from '../../defs/router';
import { ModuleBacktestingRouter } from '../router/module';
import { ModuleSubscribeToCurrentBacktestingTaskId } from './ModuleSubscribeToCurrentBacktestingTaskId';

export const ModuleSetCurrentTaskId = ModuleFactory((ctx) => {
    const { navigate } = ModuleBacktestingRouter(ctx);
    const { currentSocketName$ } = ModuleSocketPage(ctx);
    const subscribeToCurrentBacktestingTaskId = ModuleSubscribeToCurrentBacktestingTaskId(ctx);

    return (newTaskId: TBacktestingTask['id']) => {
        return combineLatest({
            stage: currentSocketName$,
            currentTaskId: subscribeToCurrentBacktestingTaskId(),
        }).pipe(
            first(
                (
                    v,
                ): v is {
                    stage: TSocketName;
                    currentTaskId: undefined | TBacktestingTask['id'];
                } => v.stage !== undefined && v.currentTaskId !== newTaskId,
            ),
            switchMap(({ stage }) => {
                return navigate(EBacktestingRoute.Task, {
                    socket: stage,
                    backtestingTaskId: newTaskId,
                });
            }),
        );
    };
});
