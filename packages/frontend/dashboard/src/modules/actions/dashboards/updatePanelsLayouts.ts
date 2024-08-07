import { createObservableProcedure } from '@frontend/common/src/utils/LPC/createObservableProcedure.ts';
import {
    switchMapValueDescriptor,
    takeWhileFirstSyncValueDescriptor,
} from '@frontend/common/src/utils/Rx/ValueDescriptor2.ts';
import { isEmpty, isNil } from 'lodash-es';

import type { TFullDashboard } from '../../../types/fullDashboard';
import type { TPanelGridCell } from '../../../types/panel';
import { DEFAULT_GRID_CELL } from '../../../utils/layout';
import { ModuleSubscribeToCurrentDashboard } from './currentDashboardSubscription.ts';
import { ModuleUpdateDashboard } from './updateDashboard';

export const ModuleUpdatePanelsLayouts = createObservableProcedure((ctx) => {
    const updateDashboard = ModuleUpdateDashboard(ctx);
    const subscribeToCurrentDashboard = ModuleSubscribeToCurrentDashboard(ctx);

    return (layouts: TPanelGridCell[], options) => {
        return subscribeToCurrentDashboard(undefined, options).pipe(
            takeWhileFirstSyncValueDescriptor(),
            switchMapValueDescriptor(({ value: fullDashboard }) => {
                const { activeLayout } = fullDashboard.dashboard;

                const newFullDashboard: TFullDashboard = {
                    ...fullDashboard,
                    dashboard: {
                        ...fullDashboard.dashboard,
                        panels: fullDashboard.dashboard.panels.map((panel) => {
                            const cellLayout = layouts.find(
                                ({ panelId }) => panel.panelId === panelId,
                            );
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

                return updateDashboard(newFullDashboard, options);
            }),
        );
    };
});
