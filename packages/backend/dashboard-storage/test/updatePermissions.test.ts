import { afterAll, describe, expect, it } from 'vitest';

import { Client, users } from './client/index.js';
import { createDashboard, getDashboard } from './utils/index.js';

describe('UpdatePermissions', () => {
    const client = new Client({ authenticate: true });
    const otherClient = new Client({ authenticate: true, as: users.user2.username });

    afterAll(() => {
        client.close();
        otherClient.close();
    });

    it('updates dashboard permissions for other user', async () => {
        const id = await createDashboard(client);
        let dashboard = await getDashboard(client, id);
        expect(dashboard?.permission).toBe('Owner');

        let response = await client.request({
            type: 'UpdateDashboardPermissions',
            id,
            permissions: [{ user: otherClient.username, permission: 'Viewer' }],
        });
        expect(response.state).toBe('Done');
        expect(response.payload).toMatchSnapshot();

        // We're still an owner
        dashboard = await getDashboard(client, id);
        expect(dashboard?.permission).toBe('Owner');

        // Other user has received new permission
        let dashboardAsOtherUser = await getDashboard(otherClient, id);
        expect(dashboardAsOtherUser?.permission).toBe('Viewer');

        response = await client.request({
            type: 'UpdateDashboardPermissions',
            id,
            permissions: [],
        });
        expect(response.state).toBe('Done');
        expect(response.payload).toMatchSnapshot();

        // Other user has no access to dashboard anymore
        dashboardAsOtherUser = await getDashboard(otherClient, id);
        expect(dashboardAsOtherUser).toBeUndefined();
    });

    it('cannot modify own permissions', async () => {
        const id = await createDashboard(client);
        let dashboard = await getDashboard(client, id);
        expect(dashboard?.permission).toBe('Owner');

        const response = await client.request({
            type: 'UpdateDashboardPermissions',
            id,
            permissions: [{ user: client.username, permission: 'Viewer' }],
        });

        expect(response.payload).toMatchSnapshot();

        dashboard = await getDashboard(client, id);
        expect(dashboard?.permission).toBe('Owner');
    });

    it('skips own permissions in the list of permissions', async () => {
        const id = await createDashboard(client);

        const req = {
            type: 'UpdateDashboardPermissions',
            id,
            permissions: [
                { user: client.username, permission: 'Viewer' },
                { user: otherClient.username, permission: 'Editor' },
            ],
        };

        const response = await client.request(req);
        expect(response.state).toBe('Done');
        expect(response.payload).toMatchSnapshot();

        const dashboard = await getDashboard(client, id);
        expect(dashboard?.permission).not.toBe(req.permissions[0].permission);

        const dashboardAsOtherUser = await getDashboard(otherClient, id);
        expect(dashboardAsOtherUser?.permission).toBe(req.permissions[1].permission);
    });
});
