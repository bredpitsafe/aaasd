import { subscribeToDashboardsListEnvBox } from '@frontend/common/src/actors/DashboardsStorage/envelope';
import { DEDUPE_REMOVE_DELAY, SHARE_RESET_DELAY } from '@frontend/common/src/defs/observables';
import type { TContextRef } from '@frontend/common/src/di';
import { ModuleActor } from '@frontend/common/src/modules/actor';
import type { TStorageDashboardListItem } from '@frontend/common/src/types/domain/dashboardsStorage';
import { FailFactory } from '@frontend/common/src/types/Fail';
import { dedobs } from '@frontend/common/src/utils/observable/memo';
import { shareReplayWithDelayedReset } from '@frontend/common/src/utils/Rx/share';
import { generateTraceId } from '@frontend/common/src/utils/traceId';
import {
    ExtractValueDescriptor,
    ValueDescriptorFactory,
} from '@frontend/common/src/utils/ValueDescriptor';
import type { Observable } from 'rxjs';
import { map, startWith, switchMap } from 'rxjs/operators';

import { ModuleServiceStage } from '../../../../modules/serviceStage';
import type { TCommonFailDesc } from '../../types';
import { logError, retryWithDashboardActionFails } from './utils';

const createFail = FailFactory('SubscribeServerDashboardList');
const descFactory = ValueDescriptorFactory<
    TStorageDashboardListItem[],
    TCommonFailDesc<'SubscribeServerDashboardList'>
>();

export type TSubscribeServerDashboardListReturnType = ExtractValueDescriptor<typeof descFactory>;

export function createDashboardsListSubscriptionFactory(
    ctx: TContextRef,
): () => Observable<TSubscribeServerDashboardListReturnType> {
    return dedobs(
        () => {
            const actor = ModuleActor(ctx);
            const traceId = generateTraceId();

            const { currentStage$ } = ModuleServiceStage(ctx);
            return currentStage$.pipe(
                switchMap((stage) =>
                    subscribeToDashboardsListEnvBox
                        .requestStream(actor, {
                            url: stage.url,
                            traceId,
                        })
                        .pipe(
                            map((dashboardsList) => descFactory.sync(dashboardsList, null)),
                            startWith(descFactory.unsc(null)),
                            logError(
                                'subscribeServerDashboardList',
                                'Dashboards list subscription failed',
                            ),
                            retryWithDashboardActionFails(createFail),
                            shareReplayWithDelayedReset(SHARE_RESET_DELAY),
                        ),
                ),
            );
        },
        {
            removeDelay: DEDUPE_REMOVE_DELAY,
        },
    );
}
