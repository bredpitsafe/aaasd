import { ModuleModals } from '@frontend/common/src/lib/modals';
import { createObservableProcedure } from '@frontend/common/src/utils/LPC/createObservableProcedure.ts';
import { from, of, switchMap } from 'rxjs';

import type { TDashboardItemKey } from '../../../types/fullDashboard';
import { isStorageDashboardItemKey } from '../../../types/fullDashboard/guards';

export const ModuleOpenModalChangePermissions = createObservableProcedure((ctx) => {
    const { show } = ModuleModals(ctx);

    return (dashboardItemKey: TDashboardItemKey, options) => {
        if (!isStorageDashboardItemKey(dashboardItemKey)) {
            return of(false);
        }

        return from(import('../../../widgets/DashboardPermissionsModalBody')).pipe(
            switchMap(({ DashboardPermissionsModalBody }) => {
                const cbDestroy = () => modal.destroy();

                const modal = show(
                    <DashboardPermissionsModalBody
                        dashboardItemKey={dashboardItemKey}
                        onClose={cbDestroy}
                        traceId={options.traceId}
                    />,
                );

                return of(true);
            }),
        );
    };
});
