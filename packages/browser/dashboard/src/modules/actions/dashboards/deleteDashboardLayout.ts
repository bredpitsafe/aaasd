import type { TContextRef } from '@frontend/common/src/di';
import type { TraceId } from '@frontend/common/src/utils/traceId';
import { isNil, omit } from 'lodash-es';
import type { Observable } from 'rxjs';
import { filter, first, switchMap } from 'rxjs/operators';

import type { TFullDashboard } from '../../../types/fullDashboard';
import { addMissingPanelLayouts } from '../../../utils/dashboards';
import { ModuleDashboardActions } from '../index';

export function deleteDashboardLayout(
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

            const allLayoutNames = Array.from(
                panels.reduce((set, { layouts }) => {
                    layouts.forEach(({ name }) => {
                        if (name !== layoutName) {
                            set.add(name);
                        }
                    });
                    return set;
                }, new Set<string | undefined>()),
            );

            const newFullDashboard: TFullDashboard = {
                ...fullDashboard,
                dashboard: {
                    ...dashboard,
                    activeLayout:
                        allLayoutNames.length === 0
                            ? undefined
                            : activeLayout === layoutName
                              ? allLayoutNames[0]
                              : activeLayout,
                    panels: addMissingPanelLayouts(activeLayout, panels).map((panel) => ({
                        ...panel,
                        layouts:
                            panel.layouts.length > 1
                                ? panel.layouts.filter(({ name }) => name !== layoutName)
                                : panel.layouts.map((layout) => omit(layout, 'name')),
                    })),
                },
            };

            return updateDashboard(traceId, newFullDashboard);
        }),
    );
}
