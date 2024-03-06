import type { TContextRef } from '@frontend/common/src/di';
import { ModuleActor } from '@frontend/common/src/modules/actor';
import type { Observable } from 'rxjs';

import { registerExternalDashboardEnvBox } from '../../../actors/FullDashboards/envelope';
import type {
    TFullDashboard,
    TIndicatorsDashboardItemKey,
    TRobotDashboardItemKey,
} from '../../../types/fullDashboard';

export function registerExternalDashboard(
    ctx: TContextRef,
    dashboardItemKey: TRobotDashboardItemKey | TIndicatorsDashboardItemKey,
): Observable<TFullDashboard | undefined> {
    const actor = ModuleActor(ctx);

    return registerExternalDashboardEnvBox.requestStream(actor, dashboardItemKey);
}
