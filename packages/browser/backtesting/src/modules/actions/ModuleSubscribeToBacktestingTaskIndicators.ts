import { ModuleFactory } from '@frontend/common/src/di';
import type { TIndicator } from '@frontend/common/src/modules/actions/indicators/defs';
import type {
    TBacktestingRunId,
    TBacktestingTask,
} from '@frontend/common/src/types/domain/backtestings';
import type { TSocketURL } from '@frontend/common/src/types/domain/sockets';
import { EMPTY_OBJECT } from '@frontend/common/src/utils/const';
import { dedobs } from '@frontend/common/src/utils/observable/memo';
import { toSwitch } from '@frontend/common/src/utils/Rx/dynamicMap';
import {
    distinctValueDescriptorUntilChanged,
    dynamicMapValueDescriptor,
    mapValueDescriptor,
    scanValueDescriptor,
} from '@frontend/common/src/utils/Rx/ValueDescriptor2';
import { shallowHash } from '@frontend/common/src/utils/shallowHash';
import type { TraceId } from '@frontend/common/src/utils/traceId';
import type { TValueDescriptor2 } from '@frontend/common/src/utils/ValueDescriptor/types';
import {
    createSyncedValueDescriptor,
    WAITING_VD,
} from '@frontend/common/src/utils/ValueDescriptor/utils';
import { isEmpty, isNil } from 'lodash-es';
import { Observable, of } from 'rxjs';

import { ModuleSubscribeToBacktestingRuns } from './ModuleSubscribeToBacktestingRuns';
import { ModuleSubscribeToIndicatorsMap } from './ModuleSubscribeToIndicatorsMap';

export const ModuleSubscribeToBacktestingTaskIndicators = ModuleFactory((ctx) => {
    const subscribeToBacktestingRuns = ModuleSubscribeToBacktestingRuns(ctx);
    const subscribeToIndicatorsMap = ModuleSubscribeToIndicatorsMap(ctx);

    return dedobs(
        (
            target: TSocketURL,
            taskId: TBacktestingTask['id'],
            indicatorNames: TIndicator['name'][],
            traceId: TraceId,
        ): Observable<
            TValueDescriptor2<
                Record<TBacktestingRunId, Record<TIndicator['name'], TIndicator | undefined>>
            >
        > => {
            if (isEmpty(indicatorNames)) {
                return of(
                    createSyncedValueDescriptor<
                        Record<
                            TBacktestingRunId,
                            Record<TIndicator['name'], TIndicator | undefined>
                        >
                    >(EMPTY_OBJECT),
                );
            }

            return subscribeToBacktestingRuns({ target, taskId }, { traceId }).pipe(
                mapValueDescriptor(({ value: runs }) =>
                    createSyncedValueDescriptor(runs.map((run) => run.btRunNo).sort()),
                ),
                distinctValueDescriptorUntilChanged(),
                dynamicMapValueDescriptor(({ value: backtestingRunIds }) =>
                    toSwitch(
                        isEmpty(backtestingRunIds)
                            ? of(WAITING_VD)
                            : subscribeToIndicatorsMap(
                                  target,
                                  indicatorNames,
                                  backtestingRunIds,
                                  traceId,
                              ).pipe(
                                  scanValueDescriptor(
                                      (
                                          acc:
                                              | undefined
                                              | TValueDescriptor2<
                                                    Record<
                                                        TBacktestingRunId,
                                                        Record<
                                                            TIndicator['name'],
                                                            TIndicator | undefined
                                                        >
                                                    >
                                                >,
                                          { value: map },
                                      ) => {
                                          const res = createSyncedValueDescriptor(acc?.value ?? {});

                                          for (const key in map) {
                                              const indicator = map[key as keyof typeof map];
                                              if (isNil(indicator.btRunNo)) {
                                                  continue;
                                              }

                                              if (isNil(res.value[indicator.btRunNo])) {
                                                  res.value[indicator.btRunNo] = {
                                                      [indicator.name]: indicator,
                                                  };
                                              } else {
                                                  res.value[indicator.btRunNo][indicator.name] =
                                                      indicator;
                                              }
                                          }

                                          return res;
                                      },
                                  ),
                              ),
                    ),
                ),
            );
        },
        {
            normalize: ([url, taskId, name]) => shallowHash(url, taskId, name),
            removeDelay: 0,
            resetDelay: 0,
        },
    );
});
