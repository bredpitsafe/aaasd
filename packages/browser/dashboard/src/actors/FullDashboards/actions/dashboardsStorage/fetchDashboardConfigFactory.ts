import { fetchDashboardConfigEnvBox } from '@frontend/common/src/actors/DashboardsStorage/envelope';
import { DEDUPE_REMOVE_DELAY, SHARE_RESET_DELAY } from '@frontend/common/src/defs/observables';
import type { TContextRef } from '@frontend/common/src/di';
import { ModuleActor } from '@frontend/common/src/modules/actor';
import type {
    TStorageDashboardConfig,
    TStorageDashboardId,
} from '@frontend/common/src/types/domain/dashboardsStorage';
import { dedobs } from '@frontend/common/src/utils/observable/memo';
import { shareReplayWithDelayedReset } from '@frontend/common/src/utils/Rx/share';
import { shallowHash } from '@frontend/common/src/utils/shallowHash';
import { generateTraceId } from '@frontend/common/src/utils/traceId';
import { TValueDescriptor2 } from '@frontend/common/src/utils/ValueDescriptor/types';
import {
    createSyncedValueDescriptor,
    LOADING_VD,
} from '@frontend/common/src/utils/ValueDescriptor/utils';
import type { Observable } from 'rxjs';
import { map, startWith, switchMap } from 'rxjs/operators';

import { ModuleServiceStage } from '../../../../modules/serviceStage';
import { logError } from './utils';

export function fetchDashboardConfigFactory(
    ctx: TContextRef,
): (
    id: TStorageDashboardId,
    digest: string,
) => Observable<TValueDescriptor2<TStorageDashboardConfig>> {
    return dedobs(
        (id: TStorageDashboardId, digest: string) => {
            const actor = ModuleActor(ctx);

            const traceId = generateTraceId();

            const { currentStage$ } = ModuleServiceStage(ctx);
            return currentStage$.pipe(
                switchMap((stage) =>
                    fetchDashboardConfigEnvBox
                        .request(actor, {
                            url: stage.url,
                            id,
                            digest,
                            traceId,
                        })
                        .pipe(
                            map(createSyncedValueDescriptor),
                            startWith(LOADING_VD),
                            logError(
                                'fetchServerDashboardConfig',
                                'Failed to fetch dashboard config',
                            ),
                            shareReplayWithDelayedReset(SHARE_RESET_DELAY),
                        ),
                ),
            );
        },
        {
            removeDelay: DEDUPE_REMOVE_DELAY,
            normalize: ([id, digest]) => shallowHash(id, digest),
        },
    );
}
