import type { TUser } from '@backend/bff/src/modules/authorization/schemas/SubscribeToUserSnapshot.schema.ts';
import type { TUserName } from '@frontend/common/src/modules/user';
import type { TStorageDashboardPermission } from '@frontend/common/src/types/domain/dashboardsStorage';
import {
    EStorageDashboardPermission,
    EStorageDashboardSharePermission,
} from '@frontend/common/src/types/domain/dashboardsStorage';
import { useFunction } from '@frontend/common/src/utils/React/useFunction';
import { useSyncState } from '@frontend/common/src/utils/React/useSyncState';
import { isNil, sortBy } from 'lodash-es';
import { useMemo } from 'react';

import type { TDashboardPermission, TPermissionKey } from './defs';
import { EVERYONE_PERMISSION_KEY } from './defs';

const SHARE_PERMISSIONS_LIST = [
    EStorageDashboardPermission.Editor,
    EStorageDashboardPermission.Viewer,
    EStorageDashboardPermission.None,
];
const PERMISSIONS_LIST = [
    EStorageDashboardPermission.Owner,
    EStorageDashboardPermission.Editor,
    EStorageDashboardPermission.Viewer,
    EStorageDashboardPermission.None,
];

export type TPermissionItem = {
    key: TPermissionKey;
    user: TUser;
    permission: TDashboardPermission;
    possiblePermissions: TDashboardPermission[];
};

export function usePermissions(
    enableActiveFilter: boolean,
    sharePermission: EStorageDashboardSharePermission,
    permissions: TStorageDashboardPermission[],
    users: TUser[],
    onSetSharePermissions: (sharePermission: EStorageDashboardSharePermission) => Promise<boolean>,
    onSetPermissionsList: (permissions: TStorageDashboardPermission[]) => Promise<boolean>,
): {
    list: TPermissionItem[];
    changePermission: (keys: TPermissionKey[], permission: TDashboardPermission) => void;
    resetUserChanges: VoidFunction;
    hasPermissionChanges: boolean;
    submitAllPermissions: () => Promise<boolean>;
} {
    const [newSharePermission, setNewSharePermission] = useSyncState(sharePermission, [
        sharePermission,
    ]);

    const cleanUserToPermissionMapOriginal = useMemo(
        () =>
            new Map<TUserName, EStorageDashboardPermission>(
                permissions.map(({ user, permission }) => [user, permission]),
            ),
        [permissions],
    );

    const usernameToUserMap = useMemo(
        () =>
            users.reduce(
                (map, user) => ({ ...map, [user.name]: user }),
                {} as Record<TUserName, TUser>,
            ),
        [users],
    );

    const userToPermissionMapOriginal = useMemo(
        () =>
            permissions.reduce(
                (map, { user, permission }) => {
                    map.set(user, permission);
                    return map;
                },
                new Map<TUserName, EStorageDashboardPermission>(
                    users.map((user) => [user.name as TUserName, EStorageDashboardPermission.None]),
                ),
            ),
        [permissions, users],
    );

    const [userToPermissionMap, setUserToPermissionMap] = useSyncState(
        userToPermissionMapOriginal,
        [userToPermissionMapOriginal],
    );

    const changePermission = useFunction(
        (keys: TPermissionKey[], permission: TDashboardPermission) => {
            const newUserToPermissionMap = new Map(userToPermissionMap);

            keys.forEach((key) => {
                if (key === EVERYONE_PERMISSION_KEY) {
                    if (permission === EStorageDashboardPermission.Owner) {
                        setNewSharePermission(EStorageDashboardSharePermission.Editor);
                    } else if (isSharePermission(permission)) {
                        setNewSharePermission(permission);
                    }

                    return;
                }

                if (
                    !userToPermissionMap.has(key) ||
                    !PERMISSIONS_LIST.includes(permission as EStorageDashboardPermission)
                ) {
                    return;
                }

                newUserToPermissionMap.set(key, permission as EStorageDashboardPermission);
                setUserToPermissionMap(newUserToPermissionMap);
            });
        },
    );
    const resetUserChanges = useFunction(() => {
        setNewSharePermission(sharePermission);
        setUserToPermissionMap(userToPermissionMapOriginal);
    });

    const list = useMemo(
        () =>
            [
                {
                    key: EVERYONE_PERMISSION_KEY as TPermissionKey,
                    user: {
                        name: 'Everyone' as TUserName,
                        displayName: 'Everyone',
                        groups: [],
                        policies: [],
                    } as TUser,
                    permission: isPermission(newSharePermission)
                        ? newSharePermission
                        : EStorageDashboardPermission.None,
                    possiblePermissions: SHARE_PERMISSIONS_LIST,
                },
                ...sortBy(
                    Array.from(userToPermissionMap.entries())
                        .filter(([username]) => !isNil(usernameToUserMap[username]))
                        .map(([username, permission]) => ({
                            key: username as TPermissionKey,
                            user: usernameToUserMap[username],
                            permission,
                            possiblePermissions: PERMISSIONS_LIST,
                        })),
                    ({ user }) => user,
                ),
            ].filter(
                ({ user, key }) =>
                    !enableActiveFilter ||
                    cleanUserToPermissionMapOriginal.has(user.name as TUserName) ||
                    key === EVERYONE_PERMISSION_KEY,
            ),
        [
            newSharePermission,
            userToPermissionMap,
            enableActiveFilter,
            cleanUserToPermissionMapOriginal,
            usernameToUserMap,
        ],
    );

    const newPermissions = useMemo(
        () =>
            Array.from(userToPermissionMap.entries())
                .map(([user, permission]) => ({
                    user,
                    permission,
                }))
                .filter(
                    ({ user, permission }) =>
                        permission !== EStorageDashboardPermission.None ||
                        cleanUserToPermissionMapOriginal.has(user),
                ),
        [userToPermissionMap, cleanUserToPermissionMapOriginal],
    );

    const hasPermissionsChanges = useMemo(
        () =>
            newPermissions.length !== permissions.length ||
            newPermissions.some(
                ({ user, permission }) => permission !== userToPermissionMapOriginal.get(user),
            ),
        [newPermissions, permissions, userToPermissionMapOriginal],
    );

    const hasSharePermissionsChanges = useMemo(
        () => newSharePermission !== sharePermission,
        [newSharePermission, sharePermission],
    );

    const cbSubmitAllPermissions = useFunction(async () => {
        if (hasSharePermissionsChanges && !(await onSetSharePermissions(newSharePermission))) {
            return false;
        }

        if (hasPermissionsChanges && !(await onSetPermissionsList(newPermissions))) {
            return false;
        }

        return true;
    });

    return {
        list,
        changePermission,
        resetUserChanges,
        hasPermissionChanges: hasPermissionsChanges || hasSharePermissionsChanges,
        submitAllPermissions: cbSubmitAllPermissions,
    };
}

function isSharePermission(
    permission: TDashboardPermission,
): permission is EStorageDashboardSharePermission {
    return (SHARE_PERMISSIONS_LIST as string[]).includes(permission);
}

function isPermission(permission: TDashboardPermission): permission is EStorageDashboardPermission {
    return (PERMISSIONS_LIST as string[]).includes(permission);
}
