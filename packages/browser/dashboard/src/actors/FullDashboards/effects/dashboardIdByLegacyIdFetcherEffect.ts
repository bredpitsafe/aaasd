import type { TContextRef } from '@frontend/common/src/di';
import type { Actor, ActorContext } from 'webactor';

import { fetchDashboardIdByLegacyId } from '../actions/dashboardsStorage/fetchDashboardIdByLegacyId';
import { fetchDashboardIdByLegacyIdEnvBox } from '../envelope';

export function dashboardIdByLegacyIdFetcherEffect(
    ctx: TContextRef,
    context: Actor | ActorContext,
) {
    fetchDashboardIdByLegacyIdEnvBox.responseStream(context, (legacyId) => {
        return fetchDashboardIdByLegacyId(ctx, legacyId);
    });
}
