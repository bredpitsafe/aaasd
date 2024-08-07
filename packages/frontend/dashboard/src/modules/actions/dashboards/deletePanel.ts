import { createObservableProcedure } from '@frontend/common/src/utils/LPC/createObservableProcedure.ts';
import {
    switchMapValueDescriptor,
    takeWhileFirstSyncValueDescriptor,
} from '@frontend/common/src/utils/Rx/ValueDescriptor2.ts';

import type { TPanelId } from '../../../types/panel';
import { ModuleSubscribeToCurrentDashboard } from './currentDashboardSubscription.ts';
import { ModuleUpdateDashboard } from './updateDashboard';

export const ModuleDeletePanel = createObservableProcedure((ctx) => {
    const updateDashboard = ModuleUpdateDashboard(ctx);
    const subscribeToCurrentDashboard = ModuleSubscribeToCurrentDashboard(ctx);

    return (panelId: TPanelId, options) => {
        return subscribeToCurrentDashboard(undefined, options).pipe(
            takeWhileFirstSyncValueDescriptor(),
            switchMapValueDescriptor(({ value: fullDashboard }) => {
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

                return updateDashboard(updatedFullDashboard, options);
            }),
        );
    };
});
