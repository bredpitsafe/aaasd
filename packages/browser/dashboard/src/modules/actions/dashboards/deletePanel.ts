import type { TContextRef } from '@frontend/common/src/di';
import type { TraceId } from '@frontend/common/src/utils/traceId';
import { isNil } from 'lodash-es';
import type { Observable } from 'rxjs';
import { filter, first, switchMap } from 'rxjs/operators';

import type { TFullDashboard } from '../../../types/fullDashboard';
import type { TPanelId } from '../../../types/panel';
import { ModuleDashboardActions } from '../index';

export function deletePanel(
    ctx: TContextRef,
    currentDashboard$: Observable<TFullDashboard | undefined>,
    traceId: TraceId,
    panelId: TPanelId,
): Observable<boolean> {
    const { updateDashboard } = ModuleDashboardActions(ctx);

    return currentDashboard$.pipe(
        first(),
        filter((fullDashboard): fullDashboard is TFullDashboard => !isNil(fullDashboard)),
        switchMap((fullDashboard) => {
            const newPanels = fullDashboard.dashboard.panels.filter(
                (panel) => panel.panelId !== panelId,
            );

            const updatedFullDashboard = {
                ...fullDashboard,
                dashboard: {
                    ...fullDashboard.dashboard,
                    activeLayout:
                        newPanels.length > 0 ? fullDashboard.dashboard.activeLayout : undefined,
                    panels: newPanels,
                },
            };

            return updateDashboard(traceId, updatedFullDashboard);
        }),
    );
}
