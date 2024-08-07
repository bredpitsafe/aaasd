import { wait } from '@common/utils/src/wait.js';
import { afterAll, beforeEach, describe, expect, it, vi } from 'vitest';

import { SharePermission } from '../src/def/response.js';
import { Client, users } from './client/index.js';
import initialDashboard from './fixtures/dashboard.json';
import { clearDashboards } from './utils/db.js';

describe('SubscribeToUsers', () => {
    const client = new Client({ authenticate: true });
    const client2 = new Client({ authenticate: true, as: users.user2.username });
    const client3 = new Client({ authenticate: true, as: users.user3.username });

    beforeEach(async () => {
        await clearDashboards();
    });

    afterAll(() => {
        client.close();
        client2.close();
        client3.close();
    });

    it('lists users from all dashboards (except own username)', async () => {
        const res = await client.request(initialDashboard);
        await client.request({
            type: 'UpdateDashboardShareSettings',
            id: res.payload.id,
            sharePermission: SharePermission.Viewer,
        });
        await client2.request(initialDashboard);
        await client3.request(initialDashboard);

        const response = await client.request({ type: 'SubscribeToUsers' });
        expect(response.state).toBe('InProgress');
        expect(response.payload).toEqual({
            type: 'UsersList',
            list: [{ user: client2.username }, { user: client3.username }],
        });
    });

    it('lists users from all dashboards (except @all)', async () => {
        const res = await client2.request(initialDashboard);
        await client.request({
            type: 'UpdateDashboardShareSettings',
            id: res.payload.id,
            sharePermission: SharePermission.Viewer,
        });

        const response = await client.request({ type: 'SubscribeToUsers' });
        expect(response.state).toBe('InProgress');
        expect(response.payload).toEqual({
            type: 'UsersList',
            list: [{ user: client2.username }],
        });
    });

    it('updates the list after adding a new user', async () => {
        // Subscribe to users list, it must be empty
        const obs$ = client.send({ type: 'SubscribeToUsers' });
        const subscriber = vi.fn();
        const subscription = obs$.subscribe(subscriber);

        await wait();

        // Create dashboard
        await client2.request(initialDashboard);
        await wait();

        // Subscription must have both a snapshot and an update by now
        expect(subscriber.mock.calls).toHaveLength(2);
        const firstResponse = subscriber.mock.calls[0][0];
        expect(firstResponse.payload).toEqual({
            type: 'UsersList',
            list: [],
        });

        const secondResponse = subscriber.mock.calls[1][0];
        expect(secondResponse.payload).toEqual({
            type: 'UsersList',
            list: [{ user: client2.username }],
        });

        subscription.unsubscribe();
    });

    it('does not duplicate user in snapshot', async () => {
        await client2.request(initialDashboard);
        await client2.request(initialDashboard);

        const response = await client.request({ type: 'SubscribeToUsers' });
        expect(response.payload.list).toEqual([{ user: client2.username }]);
    });

    it('does not duplicate user in update', async () => {
        await client2.request(initialDashboard);

        const obs$ = client.send({ type: 'SubscribeToUsers' });
        const subscriber = vi.fn();
        const subscription = obs$.subscribe(subscriber);

        await client2.request(initialDashboard);
        await wait();

        expect(subscriber.mock.calls).toHaveLength(1);

        subscription.unsubscribe();
    });

    it('does not return users without dashboards', async () => {
        const res = await client2.request(initialDashboard);
        await client2.request({
            type: 'DeleteDashboard',
            id: res.payload.id,
        });

        const response = await client.request({ type: 'SubscribeToUsers' });
        expect(response.payload).toEqual({
            type: 'UsersList',
            list: [],
        });
    });

    it('returns sorted users list', async () => {
        await client3.request(initialDashboard);
        await client2.request(initialDashboard);

        const response = await client.request({ type: 'SubscribeToUsers' });
        expect(response.payload).toEqual({
            type: 'UsersList',
            list: [{ user: client2.username }, { user: client3.username }].sort((u1, u2) =>
                u1.user!.localeCompare(u2.user!),
            ),
        });
    });
});
