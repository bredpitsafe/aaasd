import { generateTraceId } from '@common/utils';
import type { TContextRef } from '@frontend/common/src/di';
import { ModuleModals } from '@frontend/common/src/lib/modals';
import { createObservableProcedure } from '@frontend/common/src/utils/LPC/createObservableProcedure.ts';
import { convertValueDescriptorObservableToPromise2 } from '@frontend/common/src/utils/Rx/convertValueDescriptorObservableToPromise';
import {
    switchMapValueDescriptor,
    takeWhileFirstSyncValueDescriptor,
} from '@frontend/common/src/utils/Rx/ValueDescriptor2.ts';
import { createSyncedValueDescriptor } from '@frontend/common/src/utils/ValueDescriptor/utils.ts';
import { isNil } from 'lodash-es';
import { EMPTY, from } from 'rxjs';
import { map } from 'rxjs/operators';

import type { TDashboardItemKey, TFullDashboard } from '../../../types/fullDashboard';
import type { TPanel } from '../../../types/panel';
import { getDashboardItemKeyFromDashboard } from '../../../utils/dashboards';
import { DEFAULT_GRID_CELL } from '../../../utils/layout';
import { ModuleClonePanel } from '../dashboards/clonePanel.ts';
import { ModuleSubscribeToCurrentDashboard } from '../dashboards/currentDashboardSubscription.ts';
import { ModuleGetDashboardList } from '../fullDashboards/getDashboardList';

export const ModuleClonePanelWithDashboardSelector = createObservableProcedure((ctx) => {
    const clonePanel = ModuleClonePanel(ctx);
    const subscribeToCurrentDashboard = ModuleSubscribeToCurrentDashboard(ctx);

    return (panel: TPanel, options) => {
        return subscribeToCurrentDashboard(undefined, options).pipe(
            takeWhileFirstSyncValueDescriptor(),
            switchMapValueDescriptor(({ value: fullDashboard }) => {
                return from(getDestinationDashboard(ctx, fullDashboard)).pipe(
                    map((itemKey) => {
                        return createSyncedValueDescriptor(
                            itemKey ? { itemKey, fullDashboard } : undefined,
                        );
                    }),
                );
            }),
            switchMapValueDescriptor(({ value }) => {
                if (isNil(value)) return EMPTY;

                const panelLayout =
                    value.fullDashboard.dashboard.panels
                        .find(({ panelId }) => panelId === panel.panelId)
                        ?.layouts.find(
                            ({ name }) => name === value.fullDashboard.dashboard.activeLayout,
                        ) ?? DEFAULT_GRID_CELL;

                return clonePanel(
                    {
                        panel,
                        relWidth: panelLayout.relWidth,
                        relHeight: panelLayout.relHeight,
                        dashboardItemKey: value.itemKey,
                    },
                    options,
                );
            }),
        );
    };
});

async function getDestinationDashboard(ctx: TContextRef, currentDashboard: TFullDashboard) {
    const { show } = ModuleModals(ctx);
    const getDashboardList = ModuleGetDashboardList(ctx);

    try {
        const dashboardItems = await convertValueDescriptorObservableToPromise2(
            getDashboardList(undefined, { traceId: generateTraceId() }),
        );

        return await new Promise<TDashboardItemKey | undefined>(async (resolve) => {
            const { AddPanelFromUrl } = await import('../../../components/modals/AddPanelFromUrl');

            const modal = show(
                <AddPanelFromUrl
                    defaultDashboardItemKey={getDashboardItemKeyFromDashboard(currentDashboard)}
                    dashboardItems={dashboardItems}
                    onAdd={cbAdd}
                    onCancel={cbCancel}
                />,
            );

            async function cbAdd(dashboardItemKey: TDashboardItemKey) {
                modal.destroy();
                resolve(dashboardItemKey);
            }

            function cbCancel() {
                modal.destroy();
                resolve(undefined);
            }
        });
    } catch {
        return undefined;
    }
}
