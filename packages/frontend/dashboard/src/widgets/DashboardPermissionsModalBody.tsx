import { useModule } from '@frontend/common/src/di/react';
import type {
    EStorageDashboardSharePermission,
    TStorageDashboardPermission,
} from '@frontend/common/src/types/domain/dashboardsStorage';
import { useNotifiedObservableFunction } from '@frontend/common/src/utils/React/useObservableFunction.ts';
import { useNotifiedValueDescriptorObservable } from '@frontend/common/src/utils/React/useValueDescriptorObservable';
import type { TraceId } from '@frontend/common/src/utils/traceId';
import { isSyncedValueDescriptor } from '@frontend/common/src/utils/ValueDescriptor/utils.ts';
import { isNil } from 'lodash-es';
import { memo, useMemo } from 'react';
import { of } from 'rxjs';

import { SetDashboardPermissions } from '../components/modals/SetDashboardPermissions';
import { useShowOnlyActivePermissions } from '../components/Settings/hooks/useShowOnlyActivePermissions';
import { ModuleUpdateDashboardPermissions } from '../modules/actions/dashboards/updateDashboardPermissions.ts';
import { ModuleUpdateDashboardShareSettings } from '../modules/actions/dashboards/updateDashboardShareSettings.ts';
import { ModuleSubscribeToDashboardPermissions } from '../modules/actions/fullDashboards/getDashboardPermissionsFactory.ts';
import { ModuleSubscribeToDashboard } from '../modules/actions/fullDashboards/ModuleSubscribeToDashboard.ts';
import { ModuleSubscribeToUsers } from '../modules/actions/fullDashboards/subscribeToDashboardUsersFactory.ts';
import type { TStorageDashboardItemKey } from '../types/fullDashboard';
import { isStorageDashboard } from '../types/fullDashboard/guards';
import { getDashboardItemKeyFromDashboard } from '../utils/dashboards';

export const DashboardPermissionsModalBody = memo(
    ({
        dashboardItemKey,
        traceId,
        onClose,
    }: {
        dashboardItemKey: TStorageDashboardItemKey;
        traceId: TraceId;
        onClose: () => void;
    }) => {
        const subscribeToDashboardPermissions = useModule(ModuleSubscribeToDashboardPermissions);
        const updateDashboardShareSettings = useModule(ModuleUpdateDashboardShareSettings);
        const updateDashboardPermissions = useModule(ModuleUpdateDashboardPermissions);
        const subscribeToDashboardUsers = useModule(ModuleSubscribeToUsers);
        const subscribeToDashboard = useModule(ModuleSubscribeToDashboard);

        const { value: dashboard } = useNotifiedValueDescriptorObservable(
            subscribeToDashboard(dashboardItemKey, { traceId }),
        );
        const permissions = useNotifiedValueDescriptorObservable(
            subscribeToDashboardPermissions({ id: dashboardItemKey.storageId }, { traceId }),
        );
        const users = useNotifiedValueDescriptorObservable(
            subscribeToDashboardUsers({}, { traceId }),
        );
        const fullDashboard = useMemo(
            () => (dashboard && isStorageDashboard(dashboard) ? dashboard : undefined),
            [dashboard],
        );

        const [cbSetPermissionsList] = useNotifiedObservableFunction(
            (permissions: TStorageDashboardPermission[]) => {
                if (isNil(fullDashboard)) {
                    return of(false);
                }

                return updateDashboardPermissions(
                    {
                        itemKey: getDashboardItemKeyFromDashboard(fullDashboard),
                        permissions,
                    },
                    { traceId },
                );
            },
        );

        const [cbSetSharePermissions] = useNotifiedObservableFunction(
            (sharePermission: EStorageDashboardSharePermission) => {
                if (isNil(fullDashboard)) {
                    return of(false);
                }

                return updateDashboardShareSettings(
                    {
                        itemKey: getDashboardItemKeyFromDashboard(fullDashboard),
                        sharePermission,
                    },
                    { traceId },
                );
            },
        );

        const [showOnlyActivePermissions, setShowOnlyActivePermissions] =
            useShowOnlyActivePermissions();

        if (
            isNil(fullDashboard) ||
            !isSyncedValueDescriptor(permissions) ||
            !isSyncedValueDescriptor(users)
        ) {
            return null;
        }

        return (
            <SetDashboardPermissions
                fullDashboard={fullDashboard}
                permissions={permissions.value}
                users={users.value}
                onCancel={onClose}
                onSetPermissionsList={cbSetPermissionsList}
                onSetSharePermissions={cbSetSharePermissions}
                showOnlyActivePermissions={showOnlyActivePermissions}
                setShowOnlyActivePermissions={setShowOnlyActivePermissions}
            />
        );
    },
);
