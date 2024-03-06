import type { TContextRef } from '@frontend/common/src/di';
import type { TraceId } from '@frontend/common/src/utils/traceId';
import { isEmpty, isNil } from 'lodash-es';
import type { Observable } from 'rxjs';
import { filter, first, switchMap } from 'rxjs/operators';

import type { TFullDashboard } from '../../../types/fullDashboard';
import type { TPanelGridCell } from '../../../types/panel';
import { DEFAULT_GRID_CELL } from '../../../utils/layout';
import { ModuleDashboardActions } from '../index';

export function updatePanelsLayouts(
    ctx: TContextRef,
    currentDashboard$: Observable<TFullDashboard | undefined>,
    traceId: TraceId,
    layouts: TPanelGridCell[],
): Observable<boolean> {
    const { updateDashboard } = ModuleDashboardActions(ctx);

    return currentDashboard$.pipe(
        first(),
        filter((fullDashboard): fullDashboard is TFullDashboard => !isNil(fullDashboard)),
        switchMap((fullDashboard) => {
            const { activeLayout } = fullDashboard.dashboard;

            const newFullDashboard: TFullDashboard = {
                ...fullDashboard,
                dashboard: {
                    ...fullDashboard.dashboard,
                    panels: fullDashboard.dashboard.panels.map((panel) => {
                        const cellLayout = layouts.find(({ panelId }) => panel.panelId === panelId);
                        const originalLayout =
                            panel.layouts.find(({ name }) => name === activeLayout) ??
                            fullDashboard.dashboard.grid.panel ??
                            DEFAULT_GRID_CELL;

                        if (isNil(cellLayout)) {
                            return panel;
                        }

                        const restLayouts = panel.layouts.filter(({ name }) =>
                            isEmpty(activeLayout)
                                ? !isEmpty(name)
                                : isEmpty(name) || activeLayout !== name,
                        );

                        const currentLayout = {
                            name: isEmpty(activeLayout) ? undefined : activeLayout,
                            relX: cellLayout.relX,
                            relY: cellLayout.relY,
                            relWidth: cellLayout.relWidth,
                            relHeight: cellLayout.relHeight,
                            relMinWidth: originalLayout.relMinWidth,
                            relMinHeight: originalLayout.relMinHeight,
                        };

                        return {
                            ...panel,
                            layouts: restLayouts.concat([currentLayout]),
                        };
                    }),
                },
            };

            return updateDashboard(traceId, newFullDashboard);
        }),
    );
}
