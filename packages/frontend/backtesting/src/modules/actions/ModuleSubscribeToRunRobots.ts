import type { TraceId } from '@common/utils';
import { DEDUPE_REMOVE_DELAY, SHARE_RESET_DELAY } from '@frontend/common/src/defs/observables';
import type { TContextRef } from '@frontend/common/src/di';
import { ModuleFactory } from '@frontend/common/src/di';
import { ModuleSubscribeToComponentsSnapshot } from '@frontend/common/src/modules/actions/components/ModuleSubscribeToComponentsSnapshot.ts';
import type { TBacktestingTask } from '@frontend/common/src/types/domain/backtestings';
import type { TRobot } from '@frontend/common/src/types/domain/robots';
import type { TSocketURL } from '@frontend/common/src/types/domain/sockets';
import { EMPTY_ARRAY } from '@frontend/common/src/utils/const';
import { dedobs } from '@frontend/common/src/utils/observable/memo';
import { progressiveRetry } from '@frontend/common/src/utils/Rx/progressiveRetry';
import {
    distinctValueDescriptorUntilChanged,
    extractValueDescriptorFromError,
    mapValueDescriptor,
    switchMapValueDescriptor,
} from '@frontend/common/src/utils/Rx/ValueDescriptor2';
import { shallowHash } from '@frontend/common/src/utils/shallowHash';
import type { TValueDescriptor2 } from '@frontend/common/src/utils/ValueDescriptor/types';
import { createSyncedValueDescriptor } from '@frontend/common/src/utils/ValueDescriptor/utils';
import { isEmpty, isEqual, isNil } from 'lodash-es';
import type { Observable } from 'rxjs';
import { of } from 'rxjs';
import shallowEqual from 'shallowequal';

import { ModuleBacktestingTaskConfigs } from './ModuleBacktestingTaskConfigs';
import { getRobotHash } from './utils';

const ROBOTS_EMPTY_ARRAY = createSyncedValueDescriptor(EMPTY_ARRAY as TRobot[]);

export const ModuleSubscribeToRunRobots = ModuleFactory((ctx: TContextRef) => {
    const { getBacktestingTaskConfigs } = ModuleBacktestingTaskConfigs(ctx);
    const subscribeToComponentsUpdates = ModuleSubscribeToComponentsSnapshot(ctx);

    return dedobs(
        (
            target: TSocketURL,
            taskId: TBacktestingTask['id'],
            traceId: TraceId,
        ): Observable<TValueDescriptor2<TRobot[]>> => {
            return subscribeToComponentsUpdates({ target }, { traceId }).pipe(
                distinctValueDescriptorUntilChanged((a, b) => {
                    return isEqual(a?.robots, b?.robots);
                }),
                switchMapValueDescriptor(({ value: { robots } }) =>
                    isEmpty(robots)
                        ? of(ROBOTS_EMPTY_ARRAY)
                        : getBacktestingTaskConfigs({ target, taskId }, { traceId }).pipe(
                              mapValueDescriptor(({ value: taskConfigs }) => {
                                  if (isNil(taskConfigs)) {
                                      return ROBOTS_EMPTY_ARRAY;
                                  }

                                  const robotHashes = new Set(
                                      taskConfigs.robots.map((robot) => getRobotHash(robot)),
                                  );

                                  return createSyncedValueDescriptor(
                                      robots.filter((robot) =>
                                          robotHashes.has(getRobotHash(robot)),
                                      ),
                                  );
                              }),
                          ),
                ),
                distinctValueDescriptorUntilChanged((a, b) => {
                    return shallowEqual(a?.map(getRobotHash), b?.map(getRobotHash));
                }),
                extractValueDescriptorFromError(),
                progressiveRetry(),
            );
        },
        {
            normalize: ([url, taskId]) => shallowHash(url, taskId),
            resetDelay: SHARE_RESET_DELAY,
            removeDelay: DEDUPE_REMOVE_DELAY,
        },
    );
});
