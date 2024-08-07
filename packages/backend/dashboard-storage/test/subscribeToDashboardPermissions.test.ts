import { wait } from '@common/utils/src/wait.js';
import { afterAll, beforeEach, describe, expect, it, vi } from 'vitest';

import { Permission, SharePermission } from '../src/def/response.js';
import { Client, users } from './client/index.js';
import initialDashboard from './fixtures/dashboard.json';
import { clearDashboards } from './utils/db.js';

describe('SubscribeToDashboardPermissions', () => {
    const client = new Client({ authenticate: true });
    const client2 = new Client({ authenticate: true, as: users.user2.username });
    const client3 = new Client({ authenticate: true, as: users.user3.username });

    beforeEach(async () => {
        await clearDashboards();
    });

    afterAll(() => {
        client.close();
        client2.close();
    });

    it('lists shared permissions for own dashboard', async () => {
        const { id } = (await client.request(initialDashboard)).payload;
        const permissions = [
            { user: client2.username, permission: Permission.Viewer },
            { user: client3.username, permission: Permission.Editor },
        ];
        await client.request({
            type: 'UpdateDashboardPermissions',
            id,
            permissions,
        });

        const response = await client.request({ type: 'SubscribeToDashboardPermissions', id });
        expect(response.state).toBe('InProgress');
        expect(response.payload).toMatchObject({
            type: 'DashboardPermissionsList',
            list: permissions,
        });
    });

    it('can`t list permissions if the user is not the owner', async () => {
        const { id } = (await client.request(initialDashboard)).payload;
        const permissions = [{ user: client2.username, permission: Permission.Editor }];
        await client.request({
            type: 'UpdateDashboardPermissions',
            id,
            permissions,
        });

        const response = await client2.request({ type: 'SubscribeToDashboardPermissions', id });

        expect(response.error).toMatchSnapshot();
    });

    it('does not list own permissions', async () => {
        const { id } = (await client.request(initialDashboard)).payload;
        let response = await client.request({ type: 'SubscribeToDashboardPermissions', id });
        expect(response.payload.list).toHaveLength(0);

        const permissions = [{ user: client2.username, permission: Permission.Editor }];
        await client.request({
            type: 'UpdateDashboardPermissions',
            id,
            permissions,
        });

        response = await client.request({ type: 'SubscribeToDashboardPermissions', id });
        expect(response.payload.list).toEqual(permissions);

        expect(response.error).toMatchSnapshot();
    });

    it('does not list `@all` permissions', async () => {
        const { id } = (await client.request(initialDashboard)).payload;
        await client.request({
            type: 'UpdateDashboardShareSettings',
            id,
            sharePermission: SharePermission.Viewer,
        });

        const response = await client.request({ type: 'SubscribeToDashboardPermissions', id });
        expect(response.payload.list).toEqual([]);
    });

    it('does not list `None` permissions', async () => {
        const { id } = (await client.request(initialDashboard)).payload;
        await client.request({
            type: 'UpdateDashboardPermissions',
            id,
            permissions: [{ user: client2.username, permission: Permission.Editor }],
        });
        await client.request({
            type: 'UpdateDashboardPermissions',
            id,
            permissions: [{ user: client2.username, permission: Permission.None }],
        });

        const response = await client.request({ type: 'SubscribeToDashboardPermissions', id });
        expect(response.payload.list).toEqual([]);
    });

    it('receives updates after modifying permissions', async () => {
        const { id } = (await client.request(initialDashboard)).payload;
        const obs$ = client.send({ type: 'SubscribeToDashboardPermissions', id });
        const subscriber = vi.fn();
        const subscription = obs$.subscribe(subscriber);

        const permissions = [{ user: client2.username, permission: Permission.Editor }];
        await client.request({
            type: 'UpdateDashboardPermissions',
            id,
            permissions,
        });

        await wait();
        expect(subscriber.mock.calls).toHaveLength(2);
        const firstResponse = subscriber.mock.calls[0][0];
        expect(firstResponse.payload.list).toEqual([]);

        const secondResponse = subscriber.mock.calls[1][0];
        expect(secondResponse.payload.list).toEqual(permissions);

        subscription.unsubscribe();
    });
});
