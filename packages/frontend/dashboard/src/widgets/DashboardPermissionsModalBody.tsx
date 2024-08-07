import type { TraceId } from '@common/utils';
import type { ButtonProps } from '@frontend/common/src/components/Button.tsx';
import { Modal } from '@frontend/common/src/components/Modals.ts';
import { LoadingOverlay } from '@frontend/common/src/components/overlays/LoadingOverlay.tsx';
import { Suspense } from '@frontend/common/src/components/Suspense.tsx';
import { useModule } from '@frontend/common/src/di/react';
import { useSessionUser } from '@frontend/common/src/hooks/session/useSessionUser.ts';
import { ModuleSubscribeToUserSnapshot } from '@frontend/common/src/modules/authorization/ModuleSubscribeToUserSnapshot.ts';
import type {
    EStorageDashboardSharePermission,
    TStorageDashboardPermission,
} from '@frontend/common/src/types/domain/dashboardsStorage';
import { useFunction } from '@frontend/common/src/utils/React/useFunction.ts';
import { useNotifiedObservableFunction } from '@frontend/common/src/utils/React/useObservableFunction.ts';
import { useNotifiedValueDescriptorObservable } from '@frontend/common/src/utils/React/useValueDescriptorObservable';
import {
    isSyncedValueDescriptor,
    WAITING_VD,
} from '@frontend/common/src/utils/ValueDescriptor/utils.ts';
import { isNil } from 'lodash-es';
import { memo, useMemo, useState } from 'react';
import { lazily } from 'react-lazily';
import { of } from 'rxjs';

import { cnPermissionsModalLoadingOverlay } from '../components/modals/style.css.ts';
import { useShowOnlyActivePermissions } from '../components/Settings/hooks/useShowOnlyActivePermissions';
import { ModuleUpdateDashboardPermissions } from '../modules/actions/dashboards/updateDashboardPermissions.ts';
import { ModuleUpdateDashboardShareSettings } from '../modules/actions/dashboards/updateDashboardShareSettings.ts';
import { ModuleSubscribeToDashboardPermissions } from '../modules/actions/fullDashboards/getDashboardPermissionsFactory.ts';
import { ModuleSubscribeToDashboard } from '../modules/actions/fullDashboards/ModuleSubscribeToDashboard.ts';
import type { TStorageDashboardItemKey } from '../types/fullDashboard';
import { isStorageDashboard } from '../types/fullDashboard/guards';
import { getDashboardItemKeyFromDashboard } from '../utils/dashboards';

const { SetDashboardPermissions } = lazily(
    () => import('../components/modals/SetDashboardPermissions'),
);

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
        const [updateDashboardShareSettings] = useNotifiedObservableFunction(
            useModule(ModuleUpdateDashboardShareSettings),
            {
                getNotifyTitle: () => ({
                    loading: 'Updating share settings...',
                    success: 'Share settings updated',
                }),
            },
        );
        const [updateDashboardPermissions] = useNotifiedObservableFunction(
            useModule(ModuleUpdateDashboardPermissions),
            {
                getNotifyTitle: () => ({
                    loading: 'Updating permissions...',
                    success: 'Permissions updated',
                }),
            },
        );
        const subscribeToUsers = useModule(ModuleSubscribeToUserSnapshot);
        const subscribeToDashboard = useModule(ModuleSubscribeToDashboard);

        const { value: dashboard } = useNotifiedValueDescriptorObservable(
            subscribeToDashboard(dashboardItemKey, { traceId }),
        );
        const permissions = useNotifiedValueDescriptorObservable(
            subscribeToDashboardPermissions({ id: dashboardItemKey.storageId }, { traceId }),
        );

        const user = useSessionUser();
        const users = useNotifiedValueDescriptorObservable(
            isNil(user?.username)
                ? of(WAITING_VD)
                : subscribeToUsers(
                      {
                          filters: {
                              exclude: { names: [user.username], groups: [] },
                          },
                      },
                      { traceId },
                  ),
        );
        const fullDashboard = useMemo(
            () => (dashboard && isStorageDashboard(dashboard) ? dashboard : undefined),
            [dashboard],
        );

        const cbSetPermissionsList = async (permissions: TStorageDashboardPermission[]) => {
            if (isNil(fullDashboard)) {
                return false;
            }

            return updateDashboardPermissions(
                {
                    itemKey: getDashboardItemKeyFromDashboard(fullDashboard),
                    permissions,
                },
                { traceId },
            );
        };

        const cbSetSharePermissions = async (sharePermission: EStorageDashboardSharePermission) => {
            if (isNil(fullDashboard)) {
                return false;
            }

            return updateDashboardShareSettings(
                {
                    itemKey: getDashboardItemKeyFromDashboard(fullDashboard),
                    sharePermission,
                },
                { traceId },
            );
        };

        const [showOnlyActivePermissions, setShowOnlyActivePermissions] =
            useShowOnlyActivePermissions();

        const [modalOkButtonProps, setModalOkButtonProps] = useState<ButtonProps>({
            disabled: true,
        });

        const cbModalOkButtonPropsChanged = useFunction((newProps) => {
            setModalOkButtonProps(newProps);
        });

        return (
            <Modal
                title="Change dashboard permissions"
                open
                okButtonProps={modalOkButtonProps}
                onCancel={onClose}
            >
                <Suspense
                    component="permissions"
                    overlayClassName={cnPermissionsModalLoadingOverlay}
                >
                    {isNil(fullDashboard) ||
                    !isSyncedValueDescriptor(permissions) ||
                    !isSyncedValueDescriptor(users) ? (
                        <LoadingOverlay
                            className={cnPermissionsModalLoadingOverlay}
                            text="Loading permissions..."
                        />
                    ) : (
                        <SetDashboardPermissions
                            fullDashboard={fullDashboard}
                            permissions={permissions.value}
                            users={users.value}
                            onCancel={onClose}
                            onSetPermissionsList={cbSetPermissionsList}
                            onSetSharePermissions={cbSetSharePermissions}
                            showOnlyActivePermissions={showOnlyActivePermissions}
                            setShowOnlyActivePermissions={setShowOnlyActivePermissions}
                            onModalOkButtonPropsChanged={cbModalOkButtonPropsChanged}
                        />
                    )}
                </Suspense>
            </Modal>
        );
    },
);
