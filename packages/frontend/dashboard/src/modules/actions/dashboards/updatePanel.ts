import { createObservableProcedure } from '@frontend/common/src/utils/LPC/createObservableProcedure.ts';
import {
    switchMapValueDescriptor,
    takeWhileFirstSyncValueDescriptor,
} from '@frontend/common/src/utils/Rx/ValueDescriptor2.ts';

import type { TPanel } from '../../../types/panel';
import { ModuleSubscribeToCurrentDashboard } from './currentDashboardSubscription.ts';
import { ModuleUpdateDashboard } from './updateDashboard';

export const ModuleUpdatePanel = createObservableProcedure((ctx) => {
    const updateDashboard = ModuleUpdateDashboard(ctx);
    const subscribeToCurrentDashboard = ModuleSubscribeToCurrentDashboard(ctx);

    return (panel: TPanel, options) => {
        return subscribeToCurrentDashboard(undefined, options).pipe(
            takeWhileFirstSyncValueDescriptor(),
            switchMapValueDescriptor(({ value: fullDashboard }) => {
                const updatedFullDashboard = {
                    ...fullDashboard,
                    dashboard: {
                        ...fullDashboard.dashboard,
                        panels: fullDashboard.dashboard.panels.map((existingPanel) =>
                            existingPanel.panelId === panel.panelId ? panel : existingPanel,
                        ),
                    },
                };

                return updateDashboard(updatedFullDashboard, options);
            }),
        );
    };
});
