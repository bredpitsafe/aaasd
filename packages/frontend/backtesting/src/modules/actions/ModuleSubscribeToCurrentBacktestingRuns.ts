import type { TraceId } from '@common/utils';
import { DEDUPE_REMOVE_DELAY } from '@frontend/common/src/defs/observables';
import { ModuleFactory } from '@frontend/common/src/di';
import type { TBacktestingRun } from '@frontend/common/src/types/domain/backtestings';
import { constantNormalizer, dedobs } from '@frontend/common/src/utils/observable/memo';
import type { TValueDescriptor2 } from '@frontend/common/src/utils/ValueDescriptor/types';
import { WAITING_VD } from '@frontend/common/src/utils/ValueDescriptor/utils';
import { isNil } from 'lodash-es';
import type { Observable } from 'rxjs';
import { of } from 'rxjs';
import { switchMap } from 'rxjs/operators';

import { ModuleSubscribeToBacktestingRuns } from './ModuleSubscribeToBacktestingRuns';
import { ModuleSubscribeToRouterParams } from './ModuleSubscribeToRouterParams';

export const ModuleSubscribeToCurrentBacktestingRuns = ModuleFactory((ctx) => {
    const subscribeToRouterParams = ModuleSubscribeToRouterParams(ctx);
    const subscribeToBacktestingRuns = ModuleSubscribeToBacktestingRuns(ctx);

    return dedobs(
        (traceId: TraceId): Observable<TValueDescriptor2<TBacktestingRun[]>> =>
            subscribeToRouterParams(['url', 'taskId']).pipe(
                switchMap((model) =>
                    isNil(model.url) || isNil(model.taskId)
                        ? of(WAITING_VD)
                        : subscribeToBacktestingRuns(
                              {
                                  target: model.url,
                                  taskId: model.taskId,
                              },
                              { traceId },
                          ),
                ),
            ),
        {
            normalize: constantNormalizer,
            resetDelay: 0,
            removeDelay: DEDUPE_REMOVE_DELAY,
        },
    );
});
