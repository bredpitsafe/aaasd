import { subscribeDashboardPermissionsEnvBox } from '@frontend/common/src/actors/DashboardsStorage/envelope';
import { DEDUPE_REMOVE_DELAY, SHARE_RESET_DELAY } from '@frontend/common/src/defs/observables';
import type { TContextRef } from '@frontend/common/src/di';
import { ModuleActor } from '@frontend/common/src/modules/actor';
import type {
    TStorageDashboardId,
    TStorageDashboardPermission,
} from '@frontend/common/src/types/domain/dashboardsStorage';
import { FailFactory } from '@frontend/common/src/types/Fail';
import { dedobs } from '@frontend/common/src/utils/observable/memo';
import { shareReplayWithDelayedReset } from '@frontend/common/src/utils/Rx/share';
import type { TraceId } from '@frontend/common/src/utils/traceId';
import {
    ExtractValueDescriptor,
    ValueDescriptorFactory,
} from '@frontend/common/src/utils/ValueDescriptor';
import type { Observable } from 'rxjs';
import { map, startWith, switchMap } from 'rxjs/operators';

import { ModuleServiceStage } from '../../../../modules/serviceStage';
import type { TDashboardActionFailDesc } from '../../types';
import { logError, retryWithCommonFails } from './utils';

const createFail = FailFactory('SubscribeServerDashboardPermissions');
const descFactory = ValueDescriptorFactory<
    TStorageDashboardPermission[],
    TDashboardActionFailDesc<'SubscribeServerDashboardPermissions'>
>();

type TSubscribeServerDashboardPermissionsReturnType = ExtractValueDescriptor<typeof descFactory>;

export function createDashboardPermissionSubscriptionFactory(
    ctx: TContextRef,
): (
    id: TStorageDashboardId,
    traceId: TraceId,
) => Observable<TSubscribeServerDashboardPermissionsReturnType> {
    return dedobs(
        (id: TStorageDashboardId, traceId: TraceId) => {
            const actor = ModuleActor(ctx);

            const { currentStage$ } = ModuleServiceStage(ctx);
            return currentStage$.pipe(
                switchMap((stage) =>
                    subscribeDashboardPermissionsEnvBox
                        .requestStream(actor, {
                            url: stage.url,
                            id,
                            traceId,
                        })
                        .pipe(
                            map((permissions) => descFactory.sync(permissions, null)),
                            startWith(descFactory.unsc(null)),
                            logError(
                                'subscribeServerDashboardPermissions',
                                'Dashboard permissions subscription failed',
                            ),
                            retryWithCommonFails(createFail),
                            shareReplayWithDelayedReset(SHARE_RESET_DELAY),
                        ),
                ),
            );
        },
        {
            normalize: ([id]) => id,
            removeDelay: DEDUPE_REMOVE_DELAY,
        },
    );
}
