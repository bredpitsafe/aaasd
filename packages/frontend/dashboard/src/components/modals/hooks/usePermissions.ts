import type { TUserName } from '@frontend/common/src/modules/user';
import {
    EStorageDashboardPermission,
    EStorageDashboardSharePermission,
    TStorageDashboardPermission,
} from '@frontend/common/src/types/domain/dashboardsStorage';
import { useFunction } from '@frontend/common/src/utils/React/useFunction';
import { useSyncState } from '@frontend/common/src/utils/React/useSyncState';
import { sortBy } from 'lodash-es';
import { useMemo, useState } from 'react';

import { EVERYONE_PERMISSION_KEY, TDashboardPermission, TPermissionKey } from './defs';

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
    user: TUserName;
    permission: TDashboardPermission;
    canDelete: boolean;
    possiblePermissions: TDashboardPermission[];
};

export function usePermissions(
    enableActiveFilter: boolean,
    sharePermission: EStorageDashboardSharePermission,
    permissions: TStorageDashboardPermission[],
    users: TUserName[],
    onSetSharePermissions: (sharePermission: EStorageDashboardSharePermission) => Promise<boolean>,
    onSetPermissionsList: (permissions: TStorageDashboardPermission[]) => Promise<boolean>,
): {
    list: TPermissionItem[];
    addUser: (user: TUserName) => boolean;
    deleteUser: (key: TPermissionKey) => boolean;
    changePermission: (keys: TPermissionKey[], permission: TDashboardPermission) => void;
    resetUserChanges: VoidFunction;
    hasPermissionChanges: boolean;
    submitAllPermissions: () => Promise<boolean>;
    newUsers: TUserName[];
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

    const userToPermissionMapOriginal = useMemo(
        () =>
            permissions.reduce(
                (map, { user, permission }) => {
                    map.set(user, permission);
                    return map;
                },
                new Map<TUserName, EStorageDashboardPermission>(
                    users.map((user) => [user, EStorageDashboardPermission.None]),
                ),
            ),
        [permissions, users],
    );

    const [newUsersSet, setNewUsersSet] = useState(useMemo(() => new Set<TUserName>(), []));
    const [userToPermissionMap, setUserToPermissionMap] = useSyncState(
        userToPermissionMapOriginal,
        [userToPermissionMapOriginal],
    );

    const addUser = useFunction((user: TUserName): boolean => {
        if (userToPermissionMap.has(user)) {
            return false;
        }

        const set = new Set(newUsersSet);
        set.add(user);
        setNewUsersSet(set);

        const newUserToPermissionMap = new Map(userToPermissionMap);
        newUserToPermissionMap.set(user, EStorageDashboardPermission.Viewer);
        setUserToPermissionMap(newUserToPermissionMap);

        return true;
    });
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
    const deleteUser = useFunction((key: TPermissionKey) => {
        if (key === EVERYONE_PERMISSION_KEY || !newUsersSet.has(key)) {
            return false;
        }

        const set = new Set(newUsersSet);
        set.delete(key);
        setNewUsersSet(set);

        const newUserToPermissionMap = new Map(userToPermissionMap);
        newUserToPermissionMap.delete(key);
        setUserToPermissionMap(newUserToPermissionMap);

        return true;
    });
    const resetUserChanges = useFunction(() => {
        setNewSharePermission(sharePermission);
        setNewUsersSet(new Set());
        setUserToPermissionMap(userToPermissionMapOriginal);
    });

    const list = useMemo(
        () =>
            [
                {
                    key: EVERYONE_PERMISSION_KEY as TPermissionKey,
                    user: 'Everyone' as TUserName,
                    permission: isPermission(newSharePermission)
                        ? newSharePermission
                        : EStorageDashboardPermission.None,
                    canDelete: false,
                    possiblePermissions: SHARE_PERMISSIONS_LIST,
                },
                ...sortBy(
                    Array.from(userToPermissionMap.entries()).map(([user, permission]) => ({
                        key: user as TPermissionKey,
                        user,
                        permission,
                        canDelete: newUsersSet.has(user),
                        possiblePermissions: PERMISSIONS_LIST,
                    })),
                    ({ user }) => user,
                ),
            ].filter(
                ({ user, key }) =>
                    !enableActiveFilter ||
                    cleanUserToPermissionMapOriginal.has(user) ||
                    newUsersSet.has(user) ||
                    key === EVERYONE_PERMISSION_KEY,
            ),
        [
            newSharePermission,
            userToPermissionMap,
            newUsersSet,
            enableActiveFilter,
            cleanUserToPermissionMapOriginal,
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

    const newUsers = useMemo(() => Array.from(newUsersSet.keys()), [newUsersSet]);

    return {
        list,
        addUser,
        deleteUser,
        changePermission,
        resetUserChanges,
        hasPermissionChanges: hasPermissionsChanges || hasSharePermissionsChanges,
        submitAllPermissions: cbSubmitAllPermissions,
        newUsers,
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
