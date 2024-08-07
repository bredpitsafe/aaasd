import { wait } from '@common/utils/src/wait.js';
import { firstValueFrom, skip } from 'rxjs';
import { afterAll, beforeEach, describe, expect, it, vi } from 'vitest';

import type {
    CreateDashboardResponse,
    SubscribeToDashboardsListResponse,
} from '../src/def/response.ts';
import { Permission } from '../src/def/response.ts';
import { Client, users } from './client/index.js';
import initialDashboard from './fixtures/dashboard.json';
import { clearDashboards } from './utils/db.js';

const LIST_SUBSCRIPTION_QUERY = { type: 'SubscribeToDashboardsList' };

describe('SubscribeToDashboardsList', () => {
    const client = new Client({ authenticate: true });
    const otherClient = new Client({ authenticate: true, as: users.user2.username });

    beforeEach(async () => {
        await clearDashboards();
    });

    afterAll(() => {
        client.close();
        otherClient.close();
    });

    it('gets empty list when no dashboards in DB', async () => {
        const response = await client.request(LIST_SUBSCRIPTION_QUERY);
        expect(response.state).toBe('InProgress');
        expect(response.payload).toMatchSnapshot();
    });

    it('gets dashboard in list snapshot after creation', async () => {
        const { id } = (await client.request(initialDashboard)).payload;
        const response = await client.request(LIST_SUBSCRIPTION_QUERY);
        expect(response.state).toBe('InProgress');
        expect(response.payload.list).toHaveLength(1);
        expect(response.payload.list[0]).toMatchObject({
            id,
            name: initialDashboard.name,
            hasDraft: false,
            digest: expect.any(String),
            permission: 'Owner',
        });
    });

    it('updates the list after adding a new dashboard', async () => {
        // Step 1. Create dashboard 1.
        await client.request(initialDashboard);

        // Step 2. Subscribe to list, skip snapshot and wait for the update.
        const responsePromise = firstValueFrom(client.send(LIST_SUBSCRIPTION_QUERY).pipe(skip(1)));

        // Step 3. Create dashboard 2.
        const { id } = (await client.request(initialDashboard)).payload as CreateDashboardResponse;

        const response = await responsePromise;
        const payload = response.payload as SubscribeToDashboardsListResponse;
        expect(response.state).toBe('InProgress');
        expect(payload.list).toHaveLength(2);
        expect(payload.list[1]).toMatchObject({
            id,
            name: initialDashboard.name,
            hasDraft: false,
            digest: expect.any(String),
            permission: 'Owner',
        });
    });

    it('updates the list after adding a dashboard through permissions', async () => {
        // Step 1. Subscribe to list, skip snapshot and wait for the update.
        const responsePromise = firstValueFrom(client.send(LIST_SUBSCRIPTION_QUERY).pipe(skip(1)));

        // Step 2. Create dashboard as another user.
        const { id } = (await otherClient.request(initialDashboard)).payload;

        // Step 3. Grant `Editor` permissions to the new dashboard to user1.
        const permission = Permission.Editor;
        await otherClient.request({
            type: 'UpdateDashboardPermissions',
            id,
            permissions: [{ user: client.username, permission }],
        });

        // Step 4. Wait for an update to come when permission has been granted
        const response = await responsePromise;
        const payload = response.payload as SubscribeToDashboardsListResponse;
        expect(response.state).toBe('InProgress');
        expect(payload.list).toHaveLength(1);
        expect(payload.list[0]).toMatchObject({
            id,
            name: initialDashboard.name,
            hasDraft: false,
            digest: expect.any(String),
            permission,
        });
    });

    it('updates the list after removing dashboard permissions', async () => {
        // Step 1. Create dashboard as another user and grant `Owner` permissions to user1.
        const { id } = (await otherClient.request(initialDashboard)).payload;

        await otherClient.request({
            type: 'UpdateDashboardPermissions',
            id,
            permissions: [{ user: client.username, permission: Permission.Owner }],
        });

        // Step 3. Subscribe to the list and wait for an update.
        const responsePromise = firstValueFrom(client.send(LIST_SUBSCRIPTION_QUERY).pipe(skip(1)));

        // Step 4. Revoke previously assigned permissions.
        await otherClient.request({
            type: 'UpdateDashboardPermissions',
            id,
            permissions: [{ user: client.username, permission: Permission.None }],
        });

        // Step 4. Wait for an update to come when permission has been granted
        const response = await responsePromise;
        const payload = response.payload as SubscribeToDashboardsListResponse;
        expect(response.state).toBe('InProgress');
        expect(payload.list).toHaveLength(0);
    });

    it('updates the list when owners change', async () => {
        // Step 1. Create dashboard.
        const { id } = (await client.request(initialDashboard)).payload;

        // Step 2. Subscribe to dashboards list
        const subscriber = vi.fn();
        const subscription$ = client.send(LIST_SUBSCRIPTION_QUERY);
        const subscription = subscription$.subscribe(subscriber);

        await wait();

        // Step 3. Add another owner
        const permission = {
            id,
            type: 'UpdateDashboardPermissions',
            permissions: [{ user: otherClient.username, permission: 'Owner' }],
        };
        await client.request(permission);
        await wait();

        // Step 4. Check that update has been received
        const { length } = subscriber.mock.calls;
        expect(length).toBeGreaterThanOrEqual(2);
        expect(subscriber.mock.calls[0][0].payload.list[0].owners).toEqual([
            { user: client.username },
        ]);
        expect(subscriber.mock.calls[length - 1][0].payload.list[0].owners).toEqual([
            { user: client.username },
            { user: otherClient.username },
        ]);

        subscription.unsubscribe();
    });

    it('updates permissionsCount when dashboard is shared among other users', async () => {
        // Step 1. Create dashboard.
        const { id } = (await client.request(initialDashboard)).payload;

        // Step 2. Subscribe to dashboards list
        const subscriber = vi.fn();
        const subscription$ = client.send(LIST_SUBSCRIPTION_QUERY);
        const subscription = subscription$.subscribe(subscriber);

        await wait();

        // Step 3. Share dashboard with another user
        const permission = {
            id,
            type: 'UpdateDashboardPermissions',
            permissions: [{ user: otherClient.username, permission: 'Viewer' }],
        };
        await client.request(permission);
        await wait(1000);

        // Step 4. Check that permissionsCount has changed
        expect(subscriber.mock.calls).toHaveLength(2);
        expect(subscriber.mock.calls[0][0].payload.list[0].permissionsCount).toBe(0);
        expect(subscriber.mock.calls[1][0].payload.list[0].permissionsCount).toBe(1);

        subscription.unsubscribe();
    });
});
