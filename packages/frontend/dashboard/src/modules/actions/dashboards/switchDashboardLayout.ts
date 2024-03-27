import { createObservableProcedure } from '@frontend/common/src/utils/LPC/createObservableProcedure.ts';
import { switchMapValueDescriptor } from '@frontend/common/src/utils/Rx/ValueDescriptor2.ts';
import { isSyncedValueDescriptor } from '@frontend/common/src/utils/ValueDescriptor/utils.ts';
import { takeWhile } from 'rxjs';

import type { TFullDashboard } from '../../../types/fullDashboard';
import { addMissingPanelLayouts } from '../../../utils/dashboards';
import { ModuleSubscribeToCurrentDashboard } from './currentDashboardSubscription.ts';
import { ModuleUpdateDashboard } from './updateDashboard';

export const ModuleSwitchDashboardLayout = createObservableProcedure((ctx) => {
    const updateDashboard = ModuleUpdateDashboard(ctx);
    const subscribeToCurrentDashboard = ModuleSubscribeToCurrentDashboard(ctx);

    return (layoutName: string, options) => {
        return subscribeToCurrentDashboard(undefined, options).pipe(
            takeWhile((vd) => !isSyncedValueDescriptor(vd), true),
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
