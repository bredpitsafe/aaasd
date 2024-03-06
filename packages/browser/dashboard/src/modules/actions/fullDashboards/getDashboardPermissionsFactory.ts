import { DEDUPE_REMOVE_DELAY, SHARE_RESET_DELAY } from '@frontend/common/src/defs/observables';
import type { TContextRef } from '@frontend/common/src/di';
import { ModuleActor } from '@frontend/common/src/modules/actor';
import { ModuleNotifications } from '@frontend/common/src/modules/notifications/module';
import { assertNever } from '@frontend/common/src/utils/assert';
import { dedobs } from '@frontend/common/src/utils/observable/memo';
import { tapDesc } from '@frontend/common/src/utils/Rx/desc';
import { shareReplayWithDelayedReset } from '@frontend/common/src/utils/Rx/share';
import type { TraceId } from '@frontend/common/src/utils/traceId';
import type { Observable } from 'rxjs';

import type { TSubscribeDashboardPermissionsReturnType } from '../../../actors/FullDashboards/effects/dashboardPermissionsEffect';
import { subscribeDashboardPermissionsEnvBox } from '../../../actors/FullDashboards/envelope';
import type { TDashboardItemKey } from '../../../types/fullDashboard';
import { getUniqueDashboardItemKey } from '../../../utils/dashboards';
import { tapRuntimeError } from '../../utils';

export function getDashboardPermissionsFactory(
    ctx: TContextRef,
): (
    dashboardItemKey: TDashboardItemKey,
    traceId: TraceId,
) => Observable<TSubscribeDashboardPermissionsReturnType> {
    const actor = ModuleActor(ctx);
    const { error } = ModuleNotifications(ctx);

    return dedobs(
        (dashboardItemKey: TDashboardItemKey, traceId: TraceId) => {
            return subscribeDashboardPermissionsEnvBox
                .requestStream(actor, { traceId, dashboardItemKey })
                .pipe(
                    tapRuntimeError(error),
                    tapDesc({
                        fail: ({ code, meta }) => {
                            switch (code) {
                                case '[SubscribeDashboardPermissions]: AUTHORIZATION':
                                case '[SubscribeDashboardPermissions]: NOT_FOUND':
                                case '[SubscribeDashboardPermissions]: SERVER_NOT_PROCESSED':
                                    error({
                                        message: 'Dashboard permissions subscription failed',
                                        description: meta.message,
                                        traceId: meta.traceId,
                                    });
                                    break;
                                case '[SubscribeDashboardPermissions]: UNKNOWN':
                                    error({
                                        message: 'UI Error',
                                        description: meta,
                                    });
                                    break;
                                default:
                                    assertNever(code);
                            }
                        },
                    }),
                    shareReplayWithDelayedReset(SHARE_RESET_DELAY),
                );
        },
        {
            removeDelay: DEDUPE_REMOVE_DELAY,
            normalize: ([key]) => getUniqueDashboardItemKey(key),
        },
    );
}
