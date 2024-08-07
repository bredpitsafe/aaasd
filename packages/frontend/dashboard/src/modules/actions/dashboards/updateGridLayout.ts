import { createObservableProcedure } from '@frontend/common/src/utils/LPC/createObservableProcedure.ts';
import {
    switchMapValueDescriptor,
    takeWhileFirstSyncValueDescriptor,
} from '@frontend/common/src/utils/Rx/ValueDescriptor2.ts';

import type { TFullDashboard } from '../../../types/fullDashboard';
import type { TGridLayout, TGridSettings } from '../../../types/layout';
import {
    createDefaultGridCellSize,
    createGridSettingsByLayout,
    grindGridLayout,
} from '../../../utils/layout';
import { getGridCellPositionByIndex } from '../../../utils/panels';
import { ModuleSubscribeToCurrentDashboard } from './currentDashboardSubscription.ts';
import { ModuleUpdateDashboard } from './updateDashboard';

export const ModuleUpdateGridLayout = createObservableProcedure((ctx) => {
    const updateDashboard = ModuleUpdateDashboard(ctx);
    const subscribeToCurrentDashboard = ModuleSubscribeToCurrentDashboard(ctx);

    return (layout: TGridLayout, options) => {
        return subscribeToCurrentDashboard(undefined, options).pipe(
            takeWhileFirstSyncValueDescriptor(),
            switchMapValueDescriptor(({ value: fullDashboard }) => {
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

                return updateDashboard(newFullDashboard, options);
            }),
        );
    };
});
