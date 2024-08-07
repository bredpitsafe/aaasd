import { createObservableProcedure } from '@frontend/common/src/utils/LPC/createObservableProcedure.ts';
import {
    switchMapValueDescriptor,
    takeWhileFirstSyncValueDescriptor,
} from '@frontend/common/src/utils/Rx/ValueDescriptor2.ts';

import type { TFullDashboard } from '../../../types/fullDashboard';
import { addMissingPanelLayouts } from '../../../utils/dashboards';
import { ModuleSubscribeToCurrentDashboard } from './currentDashboardSubscription.ts';
import { ModuleUpdateDashboard } from './updateDashboard';

export const ModuleSwitchDashboardLayout = createObservableProcedure((ctx) => {
    const updateDashboard = ModuleUpdateDashboard(ctx);
    const subscribeToCurrentDashboard = ModuleSubscribeToCurrentDashboard(ctx);

    return (layoutName: string, options) => {
        return subscribeToCurrentDashboard(undefined, options).pipe(
            takeWhileFirstSyncValueDescriptor(),
            switchMapValueDescriptor(({ value: fullDashboard }) => {
                const newFullDashboard: TFullDashboard = {
                    ...fullDashboard,
                    dashboard: {
                        ...fullDashboard.dashboard,
                        activeLayout: layoutName,
                        panels: addMissingPanelLayouts(layoutName, fullDashboard.dashboard.panels),
                    },
                };

                return updateDashboard(newFullDashboard, options);
            }),
        );
    };
});
