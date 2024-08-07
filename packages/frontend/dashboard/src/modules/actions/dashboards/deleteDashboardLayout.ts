import { createObservableProcedure } from '@frontend/common/src/utils/LPC/createObservableProcedure.ts';
import {
    switchMapValueDescriptor,
    takeWhileFirstSyncValueDescriptor,
} from '@frontend/common/src/utils/Rx/ValueDescriptor2.ts';
import { omit } from 'lodash-es';

import type { TFullDashboard } from '../../../types/fullDashboard';
import { addMissingPanelLayouts } from '../../../utils/dashboards';
import { ModuleSubscribeToCurrentDashboard } from './currentDashboardSubscription.ts';
import { ModuleUpdateDashboard } from './updateDashboard';

export const ModuleDeleteDashboardLayout = createObservableProcedure((ctx) => {
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

                const allLayoutNames = Array.from(
                    panels.reduce((set, { layouts }) => {
                        layouts.forEach(({ name }) => {
                            if (name !== layoutName) {
                                set.add(name);
                            }
                        });
                        return set;
                    }, new Set<string | undefined>()),
                );

                const newFullDashboard: TFullDashboard = {
                    ...fullDashboard,
                    dashboard: {
                        ...dashboard,
                        activeLayout:
                            allLayoutNames.length === 0
                                ? undefined
                                : activeLayout === layoutName
                                  ? allLayoutNames[0]
                                  : activeLayout,
                        panels: addMissingPanelLayouts(activeLayout, panels).map((panel) => ({
                            ...panel,
                            layouts:
                                panel.layouts.length > 1
                                    ? panel.layouts.filter(({ name }) => name !== layoutName)
                                    : panel.layouts.map((layout) => omit(layout, 'name')),
                        })),
                    },
                };

                return updateDashboard(newFullDashboard, options);
            }),
        );
    };
});
