import type { TContextRef } from '@frontend/common/src/di';
import type { TraceId } from '@frontend/common/src/utils/traceId';
import { isNil } from 'lodash-es';
import type { Observable } from 'rxjs';
import { filter, first, switchMap } from 'rxjs/operators';

import type { TFullDashboard } from '../../../types/fullDashboard';
import { addMissingPanelLayouts } from '../../../utils/dashboards';
import { ModuleDashboardActions } from '../index';

export function switchDashboardLayout(
    ctx: TContextRef,
    currentDashboard$: Observable<TFullDashboard | undefined>,
    traceId: TraceId,
    layoutName: string,
): Observable<boolean> {
    const { updateDashboard } = ModuleDashboardActions(ctx);

    return currentDashboard$.pipe(
        first(),
        filter((fullDashboard): fullDashboard is TFullDashboard => !isNil(fullDashboard)),
        switchMap((fullDashboard) => {
            const newFullDashboard: TFullDashboard = {
                ...fullDashboard,
                dashboard: {
                    ...fullDashboard.dashboard,
                    activeLayout: layoutName,
                    panels: addMissingPanelLayouts(layoutName, fullDashboard.dashboard.panels),
                },
            };

            return updateDashboard(traceId, newFullDashboard);
        }),
    );
}
