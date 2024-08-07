import { wait } from '@common/utils/src/wait.js';
import { afterAll, beforeEach, describe, expect, it, vi } from 'vitest';

import { Permission, SharePermission } from '../src/def/response.js';
import { Client, users } from './client/index.js';
import initialDashboard from './fixtures/dashboard.json';
import { clearDashboards } from './utils/db.js';

describe('UpdateDashboardShareSettings', () => {
    const client = new Client({ authenticate: true });
    const otherClient = new Client({ authenticate: true, as: users.user2.username });

    beforeEach(async () => {
        await clearDashboards();
    });

    afterAll(() => {
        client.close();
        otherClient.close();
    });

    it('dashboard is accessible by other users after sharing', async () => {
        // Step 1. Create new dashboard.
        const { id } = (await client.request(initialDashboard)).payload;

        // Step 2. Share it to others.
        const shareResponse = await client.request({
            type: 'UpdateDashboardShareSettings',
            id,
            sharePermission: SharePermission.Viewer,
        });
        expect(shareResponse.state).toBe('Done');
        expect(shareResponse.payload.type).toBe('DashboardShareSettingsUpdated');

        // Step 3. Check that other user can access dashboard as a Viewer
        const dashboardResponse = await otherClient.request({ type: 'SubscribeToDashboard', id });
        expect(dashboardResponse.payload.dashboard).toMatchObject({
            id,
            sharePermission: SharePermission.Viewer,
        });

        // Step 4. Check that owner still has correct permissions after sharing
        const ownerDashboardResponse = await client.request({ type: 'SubscribeToDashboard', id });
        expect(ownerDashboardResponse.payload.dashboard).toMatchObject({
            id,
            permission: Permission.Owner,
            sharePermission: SharePermission.Viewer,
        });
    });

    it('shared dashboard listed after the first subscription', async () => {
        // Step 1. Create new dashboard.
        const { id } = (await client.request(initialDashboard)).payload;

        // Step 2. Share it to others.
        const shareResponse = await client.request({
            type: 'UpdateDashboardShareSettings',
            id,
            sharePermission: SharePermission.Editor,
        });
        expect(shareResponse.state).toBe('Done');

        // Step 3. Subscribe to dashboards list
        const subscriber = vi.fn();
        const subscription = otherClient
            .send({ type: 'SubscribeToDashboardsList' })
            .subscribe(subscriber);

        // Step 4. Subscribe to dashboard
        const response = await otherClient.request({ type: 'SubscribeToDashboard', id });
        expect(response.state).toBe('InProgress');

        // Step 4. Check that dashboards list has been updated with a shared dashboard
        await wait();
        expect(subscriber.mock.calls).toHaveLength(2);
        const firstResponse = subscriber.mock.calls[0][0];
        const secondResponse = subscriber.mock.calls[1][0];
        expect(
            firstResponse.payload.list.find((item: { id: string }) => item.id === id),
        ).toBeUndefined();
        expect(
            secondResponse.payload.list.find((item: { id: string }) => item.id === id),
        ).toMatchObject({
            id,
            sharePermission: SharePermission.Editor,
        });

        subscription.unsubscribe();
    });

    // This test case doesn't work for now (as expected).
    it.skip('shared dashboard access is removed after unsharing', async () => {
        // Step 1. Create new dashboard.
        const { id } = (await client.request(initialDashboard)).payload;

        // Step 2. Share it to others.
        let shareResponse = await client.request({
            type: 'UpdateDashboardShareSettings',
            id,
            sharePermission: SharePermission.Viewer,
        });
        expect(shareResponse.state).toBe('Done');

        // Step 4. Subscribe to dashboard
        let response = await otherClient.request({ type: 'SubscribeToDashboard', id });
        expect(response.state).toBe('InProgress');

        // Step 5. Unshare dashboard by owner
        shareResponse = await client.request({
            type: 'UpdateDashboardShareSettings',
            id,
            sharePermission: SharePermission.None,
        });
        expect(shareResponse.state).toBe('Done');

        // Step 6. Check that dashboard is not accessible anymore
        response = await otherClient.request({ type: 'SubscribeToDashboard', id });
        expect(response.error).not.toBeUndefined();
    });
});
