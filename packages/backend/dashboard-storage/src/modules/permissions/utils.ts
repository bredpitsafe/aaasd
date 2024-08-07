import { assertFail } from '@common/utils';
import type {
    TPermission,
    TSharePermission,
} from '@grpc-schemas/dashboard_storage-api-sdk/index.services.dashboard_storage.v1';

import type { TGrpcPermissionRow } from '../../def/permissions.ts';
import { EGroups } from '../../def/permissions.ts';

export function getMaxPermission<T extends Pick<TGrpcPermissionRow, 'permission' | 'user'>>(
    permissionRows: T[],
): { permissionRow: T; sharePermission: TSharePermission } {
    const getOrderIndex = (a: T): number =>
        (
            [
                'PERMISSION_OWNER',
                'PERMISSION_EDITOR',
                'PERMISSION_VIEWER',
                'PERMISSION_NONE',
            ] as TPermission[]
        ).findIndex((permission) => Number(a.permission === permission));
    const getUserIndex = (a: T): number => {
        if ((Object.values(EGroups) as string[]).includes(a.user)) {
            return 0;
        }
        return 1;
    };
    const sortedPermissionRows = [...permissionRows].sort((a, b) => {
        // Sort dashboards in permissions order, highest permission first.
        const orderDiff = getOrderIndex(a) - getOrderIndex(b);
        if (orderDiff !== 0) {
            return orderDiff > 0 ? 1 : -1;
        }
        // If some of the permissions have the same order, groups go first
        const userDiff = getUserIndex(a) - getUserIndex(b);

        return userDiff > 0 ? 1 : -1;
    });
    const [permissionRow] = sortedPermissionRows;
    const sharePermission: TSharePermission = permissionToSharePermission(
        sortedPermissionRows.find((p) => p.user === EGroups.All)?.permission ?? 'PERMISSION_NONE',
    );

    return {
        permissionRow,
        sharePermission,
    };
}

export function sharePermissionToPermission(sharePermission: TSharePermission): TPermission {
    switch (sharePermission) {
        case 'SHARE_PERMISSION_EDITOR':
            return 'PERMISSION_EDITOR';
        case 'SHARE_PERMISSION_VIEWER':
            return 'PERMISSION_VIEWER';
        case 'SHARE_PERMISSION_NONE':
            return 'PERMISSION_NONE';
        case 'SHARE_PERMISSION_UNSPECIFIED':
            assertFail(sharePermission);
    }
}

function permissionToSharePermission(permission: TPermission): TSharePermission {
    switch (permission) {
        case 'PERMISSION_OWNER':
        case 'PERMISSION_EDITOR':
            return 'SHARE_PERMISSION_EDITOR';
        case 'PERMISSION_VIEWER':
            return 'SHARE_PERMISSION_VIEWER';
        case 'PERMISSION_NONE':
            return 'SHARE_PERMISSION_NONE';
        case 'PERMISSION_UNSPECIFIED':
            assertFail(permission);
    }
}
