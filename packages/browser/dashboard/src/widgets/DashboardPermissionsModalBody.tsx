import { useModule } from '@frontend/common/src/di/react';
import type {
    EStorageDashboardSharePermission,
    TStorageDashboardPermission,
} from '@frontend/common/src/types/domain/dashboardsStorage';
import { useFunction } from '@frontend/common/src/utils/React/useFunction';
import { useSyncObservable } from '@frontend/common/src/utils/React/useSyncObservable';
import { useNotifiedValueDescriptorObservable } from '@frontend/common/src/utils/React/useValueDescriptorObservable';
import type { TraceId } from '@frontend/common/src/utils/traceId';
import { isSyncDesc, UnscDesc } from '@frontend/common/src/utils/ValueDescriptor';
import { isNil } from 'lodash-es';
import { memo, useMemo } from 'react';
import { firstValueFrom } from 'rxjs';

import type { TSubscribeServerDashboardUsersReturnType } from '../actors/FullDashboards/actions/dashboardsStorage/createDashboardUsersSubscriptionFactory';
import type { TSubscribeDashboardPermissionsReturnType } from '../actors/FullDashboards/effects/dashboardPermissionsEffect';
import { SetDashboardPermissions } from '../components/modals/SetDashboardPermissions';
import { useShowOnlyActivePermissions } from '../components/Settings/hooks/useShowOnlyActivePermissions';
import { ModuleDashboardActions } from '../modules/actions';
import { ModuleDashboardsStorage } from '../modules/actions/fullDashboards';
import { ModuleGetDashboardValueDescriptor } from '../modules/actions/fullDashboards/ModuleGetDashboardValueDescriptor';
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
        const { updateDashboardPermissions, updateDashboardShareSettings } =
            useModule(ModuleDashboardActions);

        const { getDashboardPermissions$, getDashboardUsers$ } = useModule(ModuleDashboardsStorage);

        const getDashboard$ = useModule(ModuleGetDashboardValueDescriptor);

        const { value: dashboard } = useNotifiedValueDescriptorObservable(
            getDashboard$(dashboardItemKey),
        );
        const permissions = useSyncObservable(
            getDashboardPermissions$(dashboardItemKey, traceId),
            useMemo(() => UnscDesc(null) as TSubscribeDashboardPermissionsReturnType, []),
        );
        const users = useSyncObservable(
            getDashboardUsers$(traceId),
            useMemo(() => UnscDesc(null) as TSubscribeServerDashboardUsersReturnType, []),
        );
        const fullDashboard = useMemo(
            () => (dashboard && isStorageDashboard(dashboard) ? dashboard : undefined),
            [dashboard],
        );

        const cbSetPermissionsList = useFunction(
            async (permissions: TStorageDashboardPermission[]) => {
                if (isNil(fullDashboard)) {
                    return false;
                }

                return firstValueFrom(
                    updateDashboardPermissions(
                        getDashboardItemKeyFromDashboard(fullDashboard),
                        permissions,
                        traceId,
                    ),
                );
            },
        );

        const cbSetSharePermissions = useFunction(
            async (sharePermission: EStorageDashboardSharePermission) => {
                if (isNil(fullDashboard)) {
                    return false;
                }

                return firstValueFrom(
                    updateDashboardShareSettings(
                        getDashboardItemKeyFromDashboard(fullDashboard),
                        sharePermission,
                        traceId,
                    ),
                );
            },
        );

        const [showOnlyActivePermissions, setShowOnlyActivePermissions] =
            useShowOnlyActivePermissions();

        if (isNil(fullDashboard) || !isSyncDesc(permissions) || !isSyncDesc(users)) {
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
