import type { TContextRef } from '@frontend/common/src/di';
import { createObservableProcedure } from '@frontend/common/src/utils/LPC/createObservableProcedure.ts';
import { switchMapValueDescriptor } from '@frontend/common/src/utils/Rx/ValueDescriptor2.ts';
import { isSyncedValueDescriptor } from '@frontend/common/src/utils/ValueDescriptor/utils.ts';
import { takeWhile } from 'rxjs';

import type { TFullDashboard } from '../../../types/fullDashboard';
import { addMissingPanelLayouts } from '../../../utils/dashboards';
import { ModuleSubscribeToCurrentDashboard } from './currentDashboardSubscription.ts';
import { ModuleUpdateDashboard } from './updateDashboard';

export const ModuleCreateDashboardLayout = createObservableProcedure((ctx: TContextRef) => {
    const updateDashboard = ModuleUpdateDashboard(ctx);
    const subscribeToCurrentDashboard = ModuleSubscribeToCurrentDashboard(ctx);

    return (layoutName: string, options) => {
        return subscribeToCurrentDashboard(undefined, options).pipe(
            takeWhile((vd) => !isSyncedValueDescriptor(vd), true),
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
