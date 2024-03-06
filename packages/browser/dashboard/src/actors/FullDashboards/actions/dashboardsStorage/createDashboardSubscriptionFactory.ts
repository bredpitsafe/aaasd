import { subscribeToDashboardEnvBox } from '@frontend/common/src/actors/DashboardsStorage/envelope';
import { DEDUPE_REMOVE_DELAY } from '@frontend/common/src/defs/observables';
import type { TContextRef } from '@frontend/common/src/di';
import { ModuleActor } from '@frontend/common/src/modules/actor';
import type {
    TStorageDashboard,
    TStorageDashboardId,
} from '@frontend/common/src/types/domain/dashboardsStorage';
import { dedobs } from '@frontend/common/src/utils/observable/memo';
import { shareReplayWithImmediateReset } from '@frontend/common/src/utils/Rx/share';
import { generateTraceId } from '@frontend/common/src/utils/traceId';
import { TValueDescriptor2 } from '@frontend/common/src/utils/ValueDescriptor/types';
import {
    createSyncedValueDescriptor,
    LOADING_VD,
} from '@frontend/common/src/utils/ValueDescriptor/utils';
import type { Observable } from 'rxjs';
import { map, startWith, switchMap } from 'rxjs/operators';

import { ModuleServiceStage } from '../../../../modules/serviceStage';
import { logError, retryWithCommonFails2 } from './utils';

export function createDashboardSubscriptionFactory(
    ctx: TContextRef,
): (id: TStorageDashboardId) => Observable<TValueDescriptor2<TStorageDashboard>> {
    return dedobs(
        (id: TStorageDashboardId) => {
            const actor = ModuleActor(ctx);

            const traceId = generateTraceId();

            const { currentStage$ } = ModuleServiceStage(ctx);
            return currentStage$.pipe(
                switchMap((stage) =>
                    subscribeToDashboardEnvBox
                        .requestStream(actor, {
                            url: stage.url,
                            id,
                            traceId,
                        })
                        .pipe(
                            map(createSyncedValueDescriptor),
                            startWith(LOADING_VD),
                            logError('subscribeServerDashboard', 'Dashboard subscription failed'),
                            retryWithCommonFails2(),
                            shareReplayWithImmediateReset(),
                        ),
                ),
            );
        },
        {
            removeDelay: DEDUPE_REMOVE_DELAY,
        },
    );
}
