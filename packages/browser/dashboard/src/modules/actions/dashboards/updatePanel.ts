import type { TContextRef } from '@frontend/common/src/di';
import type { TraceId } from '@frontend/common/src/utils/traceId';
import { isNil } from 'lodash-es';
import type { Observable } from 'rxjs';
import { filter, first, switchMap } from 'rxjs/operators';

import type { TFullDashboard } from '../../../types/fullDashboard';
import type { TPanel } from '../../../types/panel';
import { ModuleDashboardActions } from '../index';

export function updatePanel(
    ctx: TContextRef,
    currentDashboard$: Observable<TFullDashboard | undefined>,
    traceId: TraceId,
    panel: TPanel,
): Observable<boolean> {
    const { updateDashboard } = ModuleDashboardActions(ctx);

    return currentDashboard$.pipe(
        first(),
        filter((fullDashboard): fullDashboard is TFullDashboard => !isNil(fullDashboard)),
        switchMap((fullDashboard) => {
            const updatedFullDashboard = {
                ...fullDashboard,
                dashboard: {
                    ...fullDashboard.dashboard,
                    panels: fullDashboard.dashboard.panels.map((existingPanel) =>
                        existingPanel.panelId === panel.panelId ? panel : existingPanel,
                    ),
                },
            };

            return updateDashboard(traceId, updatedFullDashboard);
        }),
    );
}
