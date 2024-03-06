import type { TContextRef } from '@frontend/common/src/di';
import { ModuleModals } from '@frontend/common/src/lib/modals';
import { convertValueDescriptorObservableToPromise } from '@frontend/common/src/utils/Rx/convertValueDescriptorObservableToPromise';
import type { TraceId } from '@frontend/common/src/utils/traceId';
import { isNil } from 'lodash-es';
import { firstValueFrom, Observable } from 'rxjs';

import type { TDashboardItemKey, TFullDashboard } from '../../../types/fullDashboard';
import type { TPanel } from '../../../types/panel';
import { getDashboardItemKeyFromDashboard } from '../../../utils/dashboards';
import { DEFAULT_GRID_CELL } from '../../../utils/layout';
import { clonePanel } from '../dashboards/clonePanel';
import { ModuleDashboardsStorage } from '../fullDashboards';

export async function clonePanelWithDashboardSelector(
    ctx: TContextRef,
    currentDashboard$: Observable<TFullDashboard | undefined>,
    traceId: TraceId,
    panel: TPanel,
): Promise<void> {
    const currentDashboard = await firstValueFrom(currentDashboard$);

    if (isNil(currentDashboard)) {
        return;
    }

    const dashboardItemKey = await getDestinationDashboard(ctx, currentDashboard);

    if (isNil(dashboardItemKey)) {
        return;
    }

    const panelLayout =
        currentDashboard.dashboard.panels
            .find(({ panelId }) => panelId === panel.panelId)
            ?.layouts.find(({ name }) => name === currentDashboard.dashboard.activeLayout) ??
        DEFAULT_GRID_CELL;

    await firstValueFrom(
        clonePanel(
            ctx,
            currentDashboard$,
            traceId,
            panel,
            panelLayout.relWidth,
            panelLayout.relHeight,
            dashboardItemKey,
        ),
    );
}

async function getDestinationDashboard(ctx: TContextRef, currentDashboard: TFullDashboard) {
    const { dashboardList$ } = ModuleDashboardsStorage(ctx);
    const { show } = ModuleModals(ctx);

    try {
        const dashboardItems = await convertValueDescriptorObservableToPromise(dashboardList$);

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
