import { subscribeDashboardUsersEnvBox } from '@frontend/common/src/actors/DashboardsStorage/envelope';
import { DEDUPE_REMOVE_DELAY, SHARE_RESET_DELAY } from '@frontend/common/src/defs/observables';
import type { TContextRef } from '@frontend/common/src/di';
import { ModuleActor } from '@frontend/common/src/modules/actor';
import type { TUserName } from '@frontend/common/src/modules/user';
import { FailFactory } from '@frontend/common/src/types/Fail';
import { constantNormalizer, dedobs } from '@frontend/common/src/utils/observable/memo';
import { shareReplayWithDelayedReset } from '@frontend/common/src/utils/Rx/share';
import type { TraceId } from '@frontend/common/src/utils/traceId';
import {
    ExtractValueDescriptor,
    ValueDescriptorFactory,
} from '@frontend/common/src/utils/ValueDescriptor';
import type { Observable } from 'rxjs';
import { map, startWith, switchMap } from 'rxjs/operators';

import { ModuleServiceStage } from '../../../../modules/serviceStage';
import type { TCommonFailDesc } from '../../types';
import { logError, retryWithDashboardActionFails } from './utils';

const createFail = FailFactory('SubscribeServerDashboardUsers');
const descFactory = ValueDescriptorFactory<
    TUserName[],
    TCommonFailDesc<'SubscribeServerDashboardUsers'>
>();

export type TSubscribeServerDashboardUsersReturnType = ExtractValueDescriptor<typeof descFactory>;

export function createDashboardUsersSubscriptionFactory(
    ctx: TContextRef,
): (traceId: TraceId) => Observable<TSubscribeServerDashboardUsersReturnType> {
    return dedobs(
        (traceId: TraceId) => {
            const actor = ModuleActor(ctx);

            const { currentStage$ } = ModuleServiceStage(ctx);
            return currentStage$.pipe(
                switchMap((stage) =>
                    subscribeDashboardUsersEnvBox
                        .requestStream(actor, {
                            url: stage.url,
                            traceId,
                        })
                        .pipe(
                            map((dashboardConfig) => descFactory.sync(dashboardConfig, null)),
                            startWith(descFactory.unsc(null)),
                            logError(
                                'subscribeServerDashboardUsers',
                                'Dashboards users subscription failed',
                            ),
                            retryWithDashboardActionFails(createFail),
                            shareReplayWithDelayedReset(SHARE_RESET_DELAY),
                        ),
                ),
            );
        },
        {
            normalize: constantNormalizer,
            removeDelay: DEDUPE_REMOVE_DELAY,
        },
    );
}
