import type { TRouterSubscribeState } from '@frontend/common/src/types/router';

import type { TDashboardRouterData } from '../../types/router';
import { EDashboardRoutes } from '../../types/router';
import type { TSyncViewportSyncData } from '../Chart/plugins/SyncViewport/defs';

export function getSeedSyncDataPosition(
    state: TRouterSubscribeState<TDashboardRouterData>,
): undefined | TSyncViewportSyncData {
    return state.route.name !== EDashboardRoutes.Default ? state.route.params.position : undefined;
}
