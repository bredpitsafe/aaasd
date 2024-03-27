import { createObservableProcedure } from '@frontend/common/src/utils/LPC/createObservableProcedure.ts';
import { switchMapValueDescriptor } from '@frontend/common/src/utils/Rx/ValueDescriptor2.ts';
import { isSyncedValueDescriptor } from '@frontend/common/src/utils/ValueDescriptor/utils.ts';
import { takeWhile } from 'rxjs';

import type { TPanel } from '../../../types/panel';
import { ModuleSubscribeToCurrentDashboard } from './currentDashboardSubscription.ts';
import { ModuleUpdateDashboard } from './updateDashboard';

export const ModuleUpdatePanel = createObservableProcedure((ctx) => {
    const updateDashboard = ModuleUpdateDashboard(ctx);
    const subscribeToCurrentDashboard = ModuleSubscribeToCurrentDashboard(ctx);

    return (panel: TPanel, options) => {
        return subscribeToCurrentDashboard(undefined, options).pipe(
            takeWhile((vd) => !isSyncedValueDescriptor(vd), true),
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
