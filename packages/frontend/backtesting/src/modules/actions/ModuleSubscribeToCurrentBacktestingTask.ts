import type { TraceId } from '@common/utils';
import { DEDUPE_REMOVE_DELAY } from '@frontend/common/src/defs/observables';
import { ModuleFactory } from '@frontend/common/src/di';
import type { TBacktestingTask } from '@frontend/common/src/types/domain/backtestings';
import { dedobs } from '@frontend/common/src/utils/observable/memo';
import type { TValueDescriptor2 } from '@frontend/common/src/utils/ValueDescriptor/types';
import { WAITING_VD } from '@frontend/common/src/utils/ValueDescriptor/utils';
import { isNil } from 'lodash-es';
import type { Observable } from 'rxjs';
import { of, switchMap } from 'rxjs';

import { ModuleSubscribeToBacktestingTask } from './ModuleSubscribeToBacktestingTask';
import { ModuleSubscribeToRouterParams } from './ModuleSubscribeToRouterParams';

export const ModuleSubscribeToCurrentBacktestingTask = ModuleFactory((ctx) => {
    const subscribeToRouterParams = ModuleSubscribeToRouterParams(ctx);
    const subscribeToBacktestingTask = ModuleSubscribeToBacktestingTask(ctx);

    return dedobs(
        (traceId: TraceId): Observable<TValueDescriptor2<TBacktestingTask>> =>
            subscribeToRouterParams(['url', 'taskId']).pipe(
                switchMap((model) =>
                    isNil(model.url) || isNil(model.taskId)
                        ? of(WAITING_VD)
                        : subscribeToBacktestingTask(
                              {
                                  target: model.url,
                                  taskId: model.taskId,
                              },
                              { traceId },
                          ),
                ),
            ),
        { removeDelay: DEDUPE_REMOVE_DELAY, resetDelay: 0 },
    );
});
