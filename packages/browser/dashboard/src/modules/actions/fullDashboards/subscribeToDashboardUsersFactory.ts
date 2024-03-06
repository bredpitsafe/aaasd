import { DEDUPE_REMOVE_DELAY, SHARE_RESET_DELAY } from '@frontend/common/src/defs/observables';
import type { TContextRef } from '@frontend/common/src/di';
import { ModuleActor } from '@frontend/common/src/modules/actor';
import { ModuleNotifications } from '@frontend/common/src/modules/notifications/module';
import { assertNever } from '@frontend/common/src/utils/assert';
import { constantNormalizer, dedobs } from '@frontend/common/src/utils/observable/memo';
import { tapDesc } from '@frontend/common/src/utils/Rx/desc';
import { shareReplayWithDelayedReset } from '@frontend/common/src/utils/Rx/share';
import type { TraceId } from '@frontend/common/src/utils/traceId';
import type { Observable } from 'rxjs';

import type { TSubscribeServerDashboardUsersReturnType } from '../../../actors/FullDashboards/actions/dashboardsStorage/createDashboardUsersSubscriptionFactory';
import { subscribeDashboardUsersEnvBox } from '../../../actors/FullDashboards/envelope';
import { tapRuntimeError } from '../../utils';

export function subscribeToDashboardUsersFactory(
    ctx: TContextRef,
): (traceId: TraceId) => Observable<TSubscribeServerDashboardUsersReturnType> {
    const actor = ModuleActor(ctx);
    const { error } = ModuleNotifications(ctx);

    return dedobs(
        (traceId: TraceId) => {
            return subscribeDashboardUsersEnvBox.requestStream(actor, traceId).pipe(
                tapRuntimeError(error),
                tapDesc({
                    fail: ({ code, meta }) => {
                        switch (code) {
                            case '[SubscribeServerDashboardUsers]: UNKNOWN':
                                error({
                                    message: 'UI Error',
                                    description: meta,
                                });
                                break;
                            case '[SubscribeServerDashboardUsers]: SERVER_NOT_PROCESSED':
                                error({
                                    message: 'Dashboards users subscription failed',
                                    description: meta.message,
                                    traceId: meta.traceId,
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
            normalize: constantNormalizer,
        },
    );
}
