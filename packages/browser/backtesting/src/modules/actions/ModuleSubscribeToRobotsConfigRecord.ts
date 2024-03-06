import { DEDUPE_REMOVE_DELAY, SHARE_RESET_DELAY } from '@frontend/common/src/defs/observables';
import { ModuleFactory } from '@frontend/common/src/di';
import type { TRobotConfig, TRobotConfigRecord } from '@frontend/common/src/handlers/def';
import type { TBacktestingRun } from '@frontend/common/src/types/domain/backtestings';
import type { TRobotId } from '@frontend/common/src/types/domain/robots';
import type { TSocketURL } from '@frontend/common/src/types/domain/sockets';
import { dedobs } from '@frontend/common/src/utils/observable/memo';
import {
    mapValueDescriptor,
    scanValueDescriptor,
} from '@frontend/common/src/utils/Rx/ValueDescriptor2';
import { shallowHash } from '@frontend/common/src/utils/shallowHash';
import { TraceId } from '@frontend/common/src/utils/traceId';
import { UnifierWithCompositeHash } from '@frontend/common/src/utils/unifierWithCompositeHash';
import { TValueDescriptor2 } from '@frontend/common/src/utils/ValueDescriptor/types';
import {
    createSyncedValueDescriptor,
    isSyncedValueDescriptor,
} from '@frontend/common/src/utils/ValueDescriptor/utils';
import { merge, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { ModuleGetComponentConfig } from './ModuleGetComponentConfig';

export const ModuleSubscribeToRobotsConfigRecord = ModuleFactory((ctx) => {
    const getComponentConfig = ModuleGetComponentConfig(ctx);

    return dedobs(
        (
            url: TSocketURL,
            runId: TBacktestingRun['btRunNo'],
            robotIds: TRobotId[],
            traceId: TraceId,
        ): Observable<TValueDescriptor2<TRobotConfigRecord>> => {
            return merge(
                ...robotIds.map((robotId) =>
                    getComponentConfig(
                        {
                            target: url,
                            id: robotId,
                            btRunNo: runId,
                        },
                        { traceId },
                    ).pipe(
                        mapValueDescriptor(
                            ({ value: robotConfig }): TValueDescriptor2<TRobotConfig> =>
                                createSyncedValueDescriptor({
                                    id: robotId,
                                    config: robotConfig?.config,
                                    digest: robotConfig?.digest,
                                }),
                        ),
                    ),
                ),
            ).pipe(
                scanValueDescriptor(
                    (
                        acc: undefined | TValueDescriptor2<UnifierWithCompositeHash<TRobotConfig>>,
                        { value: config },
                    ) => {
                        const cache =
                            acc?.value ?? new UnifierWithCompositeHash<TRobotConfig>('id');
                        return createSyncedValueDescriptor(cache.modify([config]));
                    },
                ),
                map((acc) =>
                    isSyncedValueDescriptor(acc)
                        ? createSyncedValueDescriptor(
                              acc.value.toArray().reduce((acc, config) => {
                                  acc[config.id] = config;
                                  return acc;
                              }, {} as TRobotConfigRecord),
                          )
                        : acc,
                ),
            );
        },
        {
            removeDelay: DEDUPE_REMOVE_DELAY,
            resetDelay: SHARE_RESET_DELAY,
            normalize: ([url, runId, robotIds]) => shallowHash(url, runId, ...robotIds),
        },
    );
});
