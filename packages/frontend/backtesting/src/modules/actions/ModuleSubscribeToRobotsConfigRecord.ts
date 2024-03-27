import { DEDUPE_REMOVE_DELAY, SHARE_RESET_DELAY } from '@frontend/common/src/defs/observables';
import { ModuleFactory } from '@frontend/common/src/di';
import type { TRobotConfig, TRobotConfigRecord } from '@frontend/common/src/handlers/def';
import type { TBacktestingRun } from '@frontend/common/src/types/domain/backtestings';
import type { TRobotId } from '@frontend/common/src/types/domain/robots';
import type { TSocketURL } from '@frontend/common/src/types/domain/sockets';
import { dedobs } from '@frontend/common/src/utils/observable/memo';
import { mapValueDescriptor } from '@frontend/common/src/utils/Rx/ValueDescriptor2';
import { shallowHash } from '@frontend/common/src/utils/shallowHash';
import { TraceId } from '@frontend/common/src/utils/traceId';
import { UnifierWithCompositeHash } from '@frontend/common/src/utils/unifierWithCompositeHash';
import { TValueDescriptor2 } from '@frontend/common/src/utils/ValueDescriptor/types';
import {
    createSyncedValueDescriptor,
    isSyncedValueDescriptor,
    LOADING_VD,
} from '@frontend/common/src/utils/ValueDescriptor/utils';
import { merge, Observable } from 'rxjs';

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
            const cache = new UnifierWithCompositeHash<TRobotConfig>('id');
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
                        mapValueDescriptor((vd) => {
                            // Pass non-sync descriptors as-is
                            if (!isSyncedValueDescriptor(vd)) {
                                return vd;
                            }

                            // It's a sync descriptor, prepare data and put it to cache
                            const record: TRobotConfig = {
                                id: robotId,
                                config: vd.value?.config,
                                digest: vd.value?.digest,
                            };
                            cache.modify([record]);

                            // Every config has loaded, switch descriptor to Synced state
                            if (cache.getSize() === robotIds.length) {
                                return createSyncedValueDescriptor(
                                    cache.toArray().reduce((acc, config) => {
                                        acc[config.id] = config;
                                        return acc;
                                    }, {} as TRobotConfigRecord),
                                );
                            }

                            // If cache is not full yet (not every config has loaded), pretend we're still loading
                            return LOADING_VD;
                        }),
                    ),
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
