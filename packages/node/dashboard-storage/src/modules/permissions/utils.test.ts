import { describe, expect, test } from 'vitest';

import { EGroups } from '../../def/permissions.ts';
import { Permission, SharePermission } from '../../def/response.ts';
import { TUserName } from '../../def/user.ts';
import { getMaxPermission } from './utils.ts';

describe('permissions utils', () => {
    const user = 'user1' as TUserName;
    const none = { permission: Permission.None, user };
    const editor = { permission: Permission.Editor, user };
    const sharedEditor = { permission: Permission.Editor, user: EGroups.All as TUserName };
    const viewer = { permission: Permission.Viewer, user };
    const sharedViewer = { permission: Permission.Viewer, user: EGroups.All as TUserName };
    const owner = { permission: Permission.Owner, user };

    test.each([
        [
            'common all',
            [none, viewer, editor, owner],
            { permission: owner, sharePermission: SharePermission.None },
        ],
        [
            'except editor',
            [viewer, owner, none],
            { permission: owner, sharePermission: SharePermission.None },
        ],
        [
            'except owner',
            [viewer, none, editor],
            { permission: editor, sharePermission: SharePermission.None },
        ],
        [
            'none + viewer',
            [none, viewer],
            { permission: viewer, sharePermission: SharePermission.None },
        ],
        ['none only', [none], { permission: none, sharePermission: SharePermission.None }],
        [
            'shared viewer',
            [viewer, sharedViewer],
            { permission: sharedViewer, sharePermission: SharePermission.Viewer },
        ],
        [
            'shared viewer + owner',
            [sharedViewer, owner],
            { permission: owner, sharePermission: SharePermission.Viewer },
        ],
        [
            'shared editor + viewer',
            [sharedEditor, viewer],
            { permission: sharedEditor, sharePermission: SharePermission.Editor },
        ],
    ])('%s', (_, permissions, expected) => {
        expect(getMaxPermission(permissions)).toEqual(expected);
    });
});
