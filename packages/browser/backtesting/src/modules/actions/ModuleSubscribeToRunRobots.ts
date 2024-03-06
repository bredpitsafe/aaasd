import { DEDUPE_REMOVE_DELAY, SHARE_RESET_DELAY } from '@frontend/common/src/defs/observables';
import { ModuleFactory, TContextRef } from '@frontend/common/src/di';
import { getTraceId } from '@frontend/common/src/handlers/utils';
import type { TBacktestingTask } from '@frontend/common/src/types/domain/backtestings';
import type { TRobot } from '@frontend/common/src/types/domain/robots';
import type { TSocketURL } from '@frontend/common/src/types/domain/sockets';
import { EMPTY_ARRAY } from '@frontend/common/src/utils/const';
import { dedobs } from '@frontend/common/src/utils/observable/memo';
import { toSwitch } from '@frontend/common/src/utils/Rx/dynamicMap';
import { progressiveRetry } from '@frontend/common/src/utils/Rx/progressiveRetry';
import {
    distinctValueDescriptorUntilChanged,
    dynamicMapValueDescriptor,
    extractValueDescriptorFromError,
    mapValueDescriptor,
} from '@frontend/common/src/utils/Rx/ValueDescriptor2';
import { shallowHash } from '@frontend/common/src/utils/shallowHash';
import { TraceId } from '@frontend/common/src/utils/traceId';
import { TValueDescriptor2 } from '@frontend/common/src/utils/ValueDescriptor/types';
import { createSyncedValueDescriptor } from '@frontend/common/src/utils/ValueDescriptor/utils';
import { isEmpty, isEqual, isNil } from 'lodash-es';
import { Observable, of } from 'rxjs';
import shallowEqual from 'shallowequal';

import { ModuleBacktestingTaskConfigs } from './ModuleBacktestingTaskConfigs';
import { ModuleSubscribeToComponentsUpdates } from './ModuleSubscribeToComponentsUpdates';
import { getRobotHash } from './utils';

const ROBOTS_EMPTY_ARRAY = createSyncedValueDescriptor(EMPTY_ARRAY as TRobot[]);

export const ModuleSubscribeToRunRobots = ModuleFactory((ctx: TContextRef) => {
    const { getBacktestingTaskConfigs } = ModuleBacktestingTaskConfigs(ctx);
    const subscribeToComponentsUpdates = ModuleSubscribeToComponentsUpdates(ctx);

    return dedobs(
        (
            url: TSocketURL,
            taskId: TBacktestingTask['id'],
            traceId: TraceId,
        ): Observable<TValueDescriptor2<TRobot[]>> => {
            return subscribeToComponentsUpdates(url, traceId).pipe(
                distinctValueDescriptorUntilChanged((a, b) => {
                    return isEqual(a?.robots, b?.robots);
                }),
                dynamicMapValueDescriptor(({ value: { robots } }) =>
                    toSwitch(
                        isEmpty(robots)
                            ? of(ROBOTS_EMPTY_ARRAY)
                            : getBacktestingTaskConfigs(taskId, getTraceId()).pipe(
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
