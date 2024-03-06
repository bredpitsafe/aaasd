import type { TContextRef } from '@frontend/common/src/di';
import { ModuleModals } from '@frontend/common/src/lib/modals';
import type { TraceId } from '@frontend/common/src/utils/traceId';

import type { TDashboardItemKey } from '../../../types/fullDashboard';
import { isStorageDashboardItemKey } from '../../../types/fullDashboard/guards';

export async function openModalChangePermissions(
    ctx: TContextRef,
    dashboardItemKey: TDashboardItemKey,
    traceId: TraceId,
): Promise<void> {
    if (!isStorageDashboardItemKey(dashboardItemKey)) {
        return;
    }

    const { show } = ModuleModals(ctx);

    const { DashboardPermissionsModalBody } = await import(
        '../../../widgets/DashboardPermissionsModalBody'
    );

    const cbDestroy = () => modal.destroy();

    const modal = show(
        <DashboardPermissionsModalBody
            traceId={traceId}
            dashboardItemKey={dashboardItemKey}
            onClose={cbDestroy}
        />,
    );
}
