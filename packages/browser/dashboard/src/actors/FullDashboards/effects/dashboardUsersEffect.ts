import type { TContextRef } from '@frontend/common/src/di';
import type { Actor, ActorContext } from 'webactor';

import { createDashboardUsersSubscriptionFactory } from '../actions/dashboardsStorage/createDashboardUsersSubscriptionFactory';
import { subscribeDashboardUsersEnvBox } from '../envelope';

export function dashboardUsersEffect(ctx: TContextRef, context: Actor | ActorContext) {
    const getDashboardUsers$ = createDashboardUsersSubscriptionFactory(ctx);

    subscribeDashboardUsersEnvBox.responseStream(context, (traceId) => {
        return getDashboardUsers$(traceId);
    });
}
