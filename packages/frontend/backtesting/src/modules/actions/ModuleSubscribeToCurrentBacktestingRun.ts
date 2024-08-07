import type { Nil } from '@common/types';
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

import { ModuleSubscribeToBacktestingRun } from './ModuleSubscribeToBacktestingRun';
import { ModuleSubscribeToRouterParams } from './ModuleSubscribeToRouterParams';

export const ModuleSubscribeToCurrentBacktestingRun = ModuleFactory((ctx) => {
    const subscribeToRouterParams = ModuleSubscribeToRouterParams(ctx);
    const subscribeToBacktestingRun = ModuleSubscribeToBacktestingRun(ctx);

    return dedobs(
        (traceId: TraceId): Observable<TValueDescriptor2<Nil | TBacktestingRun>> =>
            subscribeToRouterParams(['url', 'taskId', 'runId']).pipe(
                switchMap((model) => {
                    return isNil(model.url) || isNil(model.taskId) || isNil(model.runId)
                        ? of(WAITING_VD)
                        : subscribeToBacktestingRun(model.url, model.taskId, model.runId, traceId);
                }),
            ),
        {
            normalize: constantNormalizer,
            resetDelay: 0,
            removeDelay: DEDUPE_REMOVE_DELAY,
        },
    );
});
