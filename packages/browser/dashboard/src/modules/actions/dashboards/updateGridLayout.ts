import type { TContextRef } from '@frontend/common/src/di';
import type { TraceId } from '@frontend/common/src/utils/traceId';
import { isNil } from 'lodash-es';
import type { Observable } from 'rxjs';
import { filter, first, switchMap } from 'rxjs/operators';

import type { TFullDashboard } from '../../../types/fullDashboard';
import type { TGridLayout, TGridSettings } from '../../../types/layout';
import {
    createDefaultGridCellSize,
    createGridSettingsByLayout,
    grindGridLayout,
} from '../../../utils/layout';
import { getGridCellPositionByIndex } from '../../../utils/panels';
import { ModuleDashboardActions } from '../index';

export function updateGridLayout(
    ctx: TContextRef,
    currentDashboard$: Observable<TFullDashboard | undefined>,
    traceId: TraceId,
    layout: TGridLayout,
): Observable<boolean> {
    const { updateDashboard } = ModuleDashboardActions(ctx);

    return currentDashboard$.pipe(
        first(),
        filter((fullDashboard): fullDashboard is TFullDashboard => !isNil(fullDashboard)),
        switchMap((fullDashboard) => {
            const { activeLayout, panels } = fullDashboard.dashboard;

            const groundSettings = createGridSettingsByLayout(grindGridLayout(layout));

            const defaultCell: TGridSettings['panel'] = {
                ...createDefaultGridCellSize(layout.colsCount, layout.rowsCount),
                relMinWidth: groundSettings.panel.relMinWidth,
                relMinHeight: groundSettings.panel.relMinHeight,
            };

            const newPanels = panels.map((panel, index) => {
                const currentLayouts = panel.layouts.find(({ name }) => name === activeLayout);

                return {
                    ...panel,
                    layouts: panel.layouts
                        .filter((layout) => layout !== currentLayouts)
                        .concat([
                            {
                                ...currentLayouts,
                                ...defaultCell,
                                ...getGridCellPositionByIndex(layout, index),
                            },
                        ]),
                };
            });

            const newFullDashboard: TFullDashboard = {
                ...fullDashboard,
                dashboard: {
                    ...fullDashboard.dashboard,
                    panels: newPanels,
                },
            };

            return updateDashboard(traceId, newFullDashboard);
        }),
    );
}
