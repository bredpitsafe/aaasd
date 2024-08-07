import { createObservableProcedure } from '@frontend/common/src/utils/LPC/createObservableProcedure.ts';
import { failToError } from '@frontend/common/src/utils/Rx/failToError.ts';
import {
    switchMapValueDescriptor,
    takeWhileFirstSyncValueDescriptor,
} from '@frontend/common/src/utils/Rx/ValueDescriptor2.ts';
import { isNil } from 'lodash-es';

import type { TPanel, TPanelId } from '../../../types/panel';
import { ModuleSubscribeToCurrentDashboard } from './currentDashboardSubscription.ts';
import { ModuleUpdateDashboard } from './updateDashboard';

export const ModuleUpdatePanels = createObservableProcedure((ctx) => {
    const updateDashboard = ModuleUpdateDashboard(ctx);
    const subscribeToCurrentDashboard = ModuleSubscribeToCurrentDashboard(ctx);

    return (panelsDto: Record<TPanelId, TPanel>, options) => {
        return subscribeToCurrentDashboard(undefined, options).pipe(
            failToError(),
            takeWhileFirstSyncValueDescriptor(),
            switchMapValueDescriptor(({ value: fullDashboard }) => {
                const updatedFullDashboard = {
                    ...fullDashboard,
                    dashboard: {
                        ...fullDashboard.dashboard,
                        panels: fullDashboard.dashboard.panels.map((existingPanel) =>
                            !isNil(panelsDto[existingPanel.panelId])
                                ? panelsDto[existingPanel.panelId]
                                : existingPanel,
                        ),
                    },
                };

                return updateDashboard(updatedFullDashboard, options);
            }),
        );
    };
});
