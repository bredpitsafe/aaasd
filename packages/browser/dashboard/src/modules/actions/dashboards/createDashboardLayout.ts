import type { TContextRef } from '@frontend/common/src/di';
import type { TraceId } from '@frontend/common/src/utils/traceId';
import { isNil } from 'lodash-es';
import type { Observable } from 'rxjs';
import { filter, first, switchMap } from 'rxjs/operators';

import type { TFullDashboard } from '../../../types/fullDashboard';
import { addMissingPanelLayouts } from '../../../utils/dashboards';
import { ModuleDashboardActions } from '../index';

export function createDashboardLayout(
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
            const {
                dashboard,
                dashboard: { activeLayout, panels },
            } = fullDashboard;

            const newFullDashboard: TFullDashboard = {
                ...fullDashboard,
                dashboard: {
                    ...dashboard,
                    activeLayout: layoutName,
                    panels: addMissingPanelLayouts(activeLayout, panels).map((panel) => ({
                        ...panel,
                        layouts: panel.layouts.concat([
                            {
                                ...panel.layouts.find(({ name }) => name === activeLayout)!,
                                name: layoutName,
                            },
                        ]),
                    })),
                },
            };

            return updateDashboard(traceId, newFullDashboard);
        }),
    );
}
