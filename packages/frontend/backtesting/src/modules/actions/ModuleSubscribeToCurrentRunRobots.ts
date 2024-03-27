import { DEDUPE_REMOVE_DELAY, SHARE_RESET_DELAY } from '@frontend/common/src/defs/observables';
import { ModuleFactory } from '@frontend/common/src/di';
import type { TRobot } from '@frontend/common/src/types/domain/robots';
import { constantNormalizer, dedobs } from '@frontend/common/src/utils/observable/memo';
import { TraceId } from '@frontend/common/src/utils/traceId';
import { TValueDescriptor2 } from '@frontend/common/src/utils/ValueDescriptor/types';
import { WAITING_VD } from '@frontend/common/src/utils/ValueDescriptor/utils';
import { isNil } from 'lodash-es';
import { Observable, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';

import { ModuleSubscribeToRouterParams } from './ModuleSubscribeToRouterParams';
import { ModuleSubscribeToRunRobots } from './ModuleSubscribeToRunRobots';

export const ModuleSubscribeToCurrentRunRobots = ModuleFactory((ctx) => {
    const subscribeToRunRobots = ModuleSubscribeToRunRobots(ctx);
    const subscribeToRouterParams = ModuleSubscribeToRouterParams(ctx);

    return dedobs(
        (traceId: TraceId): Observable<TValueDescriptor2<undefined | TRobot[]>> =>
            subscribeToRouterParams(['url', 'taskId']).pipe(
                switchMap((model) =>
                    isNil(model.url) || isNil(model.taskId)
                        ? of(WAITING_VD)
                        : subscribeToRunRobots(model.url, model.taskId, traceId),
                ),
            ),
        {
            normalize: constantNormalizer,
            resetDelay: SHARE_RESET_DELAY,
            removeDelay: DEDUPE_REMOVE_DELAY,
        },
    );
});
