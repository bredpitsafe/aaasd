import type { TContextRef } from '@frontend/common/src/di';
import { createObservableProcedure } from '@frontend/common/src/utils/LPC/createObservableProcedure.ts';
import {
    switchMapValueDescriptor,
    takeWhileFirstSyncValueDescriptor,
} from '@frontend/common/src/utils/Rx/ValueDescriptor2.ts';

import type { TFullDashboard } from '../../../types/fullDashboard';
import { addMissingPanelLayouts } from '../../../utils/dashboards';
import { ModuleSubscribeToCurrentDashboard } from './currentDashboardSubscription.ts';
import { ModuleUpdateDashboard } from './updateDashboard';

export const ModuleCreateDashboardLayout = createObservableProcedure((ctx: TContextRef) => {
    const updateDashboard = ModuleUpdateDashboard(ctx);
    const subscribeToCurrentDashboard = ModuleSubscribeToCurrentDashboard(ctx);

    return (layoutName: string, options) => {
        return subscribeToCurrentDashboard(undefined, options).pipe(
            takeWhileFirstSyncValueDescriptor(),
            switchMapValueDescriptor(({ value: fullDashboard }) => {
                const {
                    dashboard,
                    dashboard: { activeLayout, panels },
                } = fullDashboard;

                const newFullDashboard: TFullDashboard = {
                    ...fullDashboard,
                    dashboard: {
                        ...dashboard,
                        activeLayout: layoutName,
                        panels: addMissingPanelLayouts(activeLayout, panels).map((panel) => ({
                            ...panel,
                            layouts: panel.layouts.concat([
                                {
                                    ...panel.layouts.find(({ name }) => name === activeLayout)!,
                                    name: layoutName,
                                },
                            ]),
                        })),
                    },
                };

                return updateDashboard(newFullDashboard, options);
            }),
        );
    };
});
