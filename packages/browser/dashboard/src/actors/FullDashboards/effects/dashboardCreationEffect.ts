import type { TContextRef } from '@frontend/common/src/di';
import type { Actor, ActorContext } from 'webactor';

import { createDashboard } from '../actions/dashboardsStorage/createDashboard';
import { createDashboardEnvBox } from '../envelope';

export function dashboardCreationEffect(ctx: TContextRef, context: Actor | ActorContext) {
    createDashboardEnvBox.responseStream(
        context,
        ({ traceId, props: { name, config, kind, status } }) =>
            createDashboard(ctx, traceId, name, config, kind, status),
    );
}
