import { EGroups, TPermission } from '../../def/permissions.ts';
import { SharePermission as RequestSharePermission } from '../../def/request.ts';
import { Permission, SharePermission } from '../../def/response.ts';

export function getMaxPermission<T extends Pick<TPermission, 'permission' | 'user'>>(
    permissions: T[],
): { permission: T; sharePermission: SharePermission } {
    const getOrderIndex = (a: T): number =>
        [Permission.Owner, Permission.Editor, Permission.Viewer, Permission.None].findIndex((p) =>
            Number(a.permission === p),
        );
    const getUserIndex = (a: T): number => {
        if ((Object.values(EGroups) as string[]).includes(a.user)) {
            return 0;
        }
        return 1;
    };
    const sortedPermissions = [...permissions].sort((a, b) => {
        // Sort dashboards in permissions order, highest permission first.
        const orderDiff = getOrderIndex(a) - getOrderIndex(b);
        if (orderDiff !== 0) {
            return orderDiff > 0 ? 1 : -1;
        }
        // If some of the permissions have the same order, groups go first
        const userDiff = getUserIndex(a) - getUserIndex(b);

        return userDiff > 0 ? 1 : -1;
    });
    const [permission] = sortedPermissions;
    const sharePermission =
        (sortedPermissions.find((p) => p.user === EGroups.All)
            ?.permission as unknown as SharePermission) ?? SharePermission.None;

    return {
        permission,
        sharePermission,
    };
}

export function sharePermissionToPermission(
    permission: SharePermission | RequestSharePermission,
): Permission {
    switch (permission) {
        case SharePermission.Editor:
        case RequestSharePermission.Editor:
            return Permission.Editor;
        case SharePermission.Viewer:
        case RequestSharePermission.Viewer:
            return Permission.Viewer;
        case SharePermission.None:
        case RequestSharePermission.None:
            return Permission.None;
    }
}
