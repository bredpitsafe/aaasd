import type { TUserName } from '@common/types/src/primitives/index.ts';
import { describe, expect, test } from 'vitest';

import type { TGrpcPermissionRow } from '../../def/permissions.ts';
import { EGroups } from '../../def/permissions.ts';
import { getMaxPermission } from './utils.ts';

type TPermissionRow = Pick<TGrpcPermissionRow, 'permission' | 'user'>;
type TMaxPermission = ReturnType<typeof getMaxPermission<TPermissionRow>>;

describe('permissions utils', () => {
    const user = 'user1' as TUserName;
    const none: TPermissionRow = { permission: 'PERMISSION_NONE', user };
    const editor: TPermissionRow = { permission: 'PERMISSION_EDITOR', user };
    const sharedEditor: TPermissionRow = {
        permission: 'PERMISSION_EDITOR',
        user: EGroups.All as TUserName,
    };
    const viewer: TPermissionRow = { permission: 'PERMISSION_VIEWER', user };
    const sharedViewer: TPermissionRow = {
        permission: 'PERMISSION_VIEWER',
        user: EGroups.All as TUserName,
    };
    const owner: TPermissionRow = { permission: 'PERMISSION_OWNER', user };

    test.each([
        [
            'common all',
            [none, viewer, editor, owner],
            { permissionRow: owner, sharePermission: 'SHARE_PERMISSION_NONE' } as TMaxPermission,
        ],
        [
            'except editor',
            [viewer, owner, none],
            { permissionRow: owner, sharePermission: 'SHARE_PERMISSION_NONE' } as TMaxPermission,
        ],
        [
            'except owner',
            [viewer, none, editor],
            { permissionRow: editor, sharePermission: 'SHARE_PERMISSION_NONE' } as TMaxPermission,
        ],
        [
            'none + viewer',
            [none, viewer],
            { permissionRow: viewer, sharePermission: 'SHARE_PERMISSION_NONE' } as TMaxPermission,
        ],
        [
            'none only',
            [none],
            { permissionRow: none, sharePermission: 'SHARE_PERMISSION_NONE' } as TMaxPermission,
        ],
        [
            'shared viewer',
            [viewer, sharedViewer],
            {
                permissionRow: sharedViewer,
                sharePermission: 'SHARE_PERMISSION_VIEWER',
            } as TMaxPermission,
        ],
        [
            'shared viewer + owner',
            [sharedViewer, owner],
            { permissionRow: owner, sharePermission: 'SHARE_PERMISSION_VIEWER' } as TMaxPermission,
        ],
        [
            'shared editor + viewer',
            [sharedEditor, viewer],
            {
                permissionRow: sharedEditor,
                sharePermission: 'SHARE_PERMISSION_EDITOR',
            } as TMaxPermission,
        ],
    ])('%s', (_, permissions, expected) => {
        expect(getMaxPermission(permissions)).toEqual(expected);
    });
});
