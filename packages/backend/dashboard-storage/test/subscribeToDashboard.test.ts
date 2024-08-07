import { wait } from '@common/utils/src/wait.js';
import type { TDashboardItem } from '@grpc-schemas/dashboard_storage-api-sdk/services/dashboard_storage/v1/common';
import { randomUUID } from 'crypto';
import { pick } from 'lodash-es';
import { firstValueFrom, share, shareReplay } from 'rxjs';
import { afterAll, beforeEach, describe, expect, it, vi } from 'vitest';

import { SharePermission } from '../src/def/response.ts';
import { generateCorrelationId } from './client/authentication.js';
import { Client, users } from './client/index.ts';
import initialDashboard from './fixtures/dashboard.json';

describe('SubscribeToDashboard', () => {
    const client = new Client({ authenticate: true });
    const otherClient = new Client({ authenticate: true, as: users.user2.username });
    let id = '';

    beforeEach(async () => {
        const createDashboardResponse = await client.request(initialDashboard);
        expect(createDashboardResponse.state).toBe('Done');
        expect(createDashboardResponse.payload.id).toMatch(/[a-f0-9-]+/);
        id = createDashboardResponse.payload.id;
    });

    afterAll(() => {
        client.close();
        otherClient.close();
    });

    it('gets initial state', async () => {
        const response = await client.request({ type: 'SubscribeToDashboard', id });
        expect(response.state).toBe('InProgress');
        expect(response.payload.dashboard).toMatchObject({
            id,
            ...pick(initialDashboard, 'name', 'kind', 'status'),
            hasDraft: false,
            permission: 'Owner',
        });
    });

    it('gets error when subscribing to non-existent dashboard', async () => {
        const response = await client.request({ type: 'SubscribeToDashboard', id: randomUUID() });

        expect(response.error).toMatchSnapshot();
    });

    it('gets error when subscribing to other user`s dashboard', async () => {
        const response = await otherClient.request({ type: 'SubscribeToDashboard', id });

        expect(response.error).toMatchSnapshot();
    });

    it('receives update after UpdateDashboard', async () => {
        const dashboard$ = client.send({ type: 'SubscribeToDashboard', id }).pipe(shareReplay(1));
        const subscriber = vi.fn();
        const subscription = dashboard$.subscribe(subscriber);
        // @ts-ignore TODO: remove this ts-ignore after tests migration to grpc
        const { dashboard } = (await firstValueFrom(dashboard$)).payload as {
            dashboard: TDashboardItem;
        };

        const updatedDashboard = {
            ...pick(dashboard, 'id', 'name', 'status', 'digest'),
            type: 'UpdateDashboard',
            config: 'updated config',
        };
        const updateResponse = await client.request(updatedDashboard);
        expect(updateResponse.state).toBe('Done');
        expect(updateResponse.payload.type).toBe('DashboardUpdated');

        await wait();
        expect(subscriber.mock.calls).toHaveLength(2);
        const updateDashboardResponse = subscriber.mock.calls[1][0];
        expect(updateDashboardResponse.state).toBe('InProgress');
        expect(updateDashboardResponse.payload.dashboard).toMatchObject({
            ...pick(dashboard, 'id', 'name', 'kind', 'status', 'hasDraft', 'permission'),
        });

        subscription.unsubscribe();
    });

    it('receives update after draft change', async () => {
        const dashboard$ = client.send({ type: 'SubscribeToDashboard', id }).pipe(shareReplay(1));
        const subscriber = vi.fn();
        const subscription = dashboard$.subscribe(subscriber);
        // @ts-ignore TODO: remove this ts-ignore after tests migration to grpc
        const { dashboard } = (await firstValueFrom(dashboard$)).payload as {
            dashboard: TDashboardItem;
        };

        const draft = {
            ...pick(dashboard, 'id'),
            type: 'UpdateDashboardDraft',
            config: 'config draft',
        };
        const updateDraftResponse = await client.request(draft);
        expect(updateDraftResponse.state).toBe('Done');
        expect(updateDraftResponse.payload.type).toBe('DashboardDraftUpdated');

        await wait();

        expect(subscriber.mock.calls).toHaveLength(2);
        const updateDashboardResponse = subscriber.mock.calls[1][0];
        expect(updateDashboardResponse.state).toBe('InProgress');
        expect(updateDashboardResponse.payload.dashboard).toMatchObject({
            ...pick(dashboard, 'id', 'name', 'kind', 'status'),
            hasDraft: true,
            permission: 'Owner',
        });

        subscription.unsubscribe();
    });

    it('receives update after permission change', async () => {
        // Step 1. Grant Owner permissions to the current dashboard to `user2`
        const permission = {
            id,
            type: 'UpdateDashboardPermissions',
            permissions: [{ user: otherClient.username, permission: 'Owner' }],
        };
        const permissionResponse = await client.request(permission);
        expect(permissionResponse.state).toBe('Done');

        // Step 2. Subscribe to current dashboard as `user2`
        const subscriber = vi.fn();
        const subscription = otherClient
            .send({ type: 'SubscribeToDashboard', id })
            .subscribe(subscriber);

        // Step 3. Change permissions to current dashboard to `Viewer` for `user2`
        const permissionsResponse = await client.request({
            ...permission,
            permissions: [{ user: otherClient.username, permission: 'Viewer' }],
        });
        expect(permissionsResponse.state).toBe('Done');
        expect(permissionsResponse.payload.type).toBe('PermissionsUpdated');

        // Step 4. Check that `user2` has received updated `Viewer` permission
        await wait();
        const { length } = subscriber.mock.calls;
        expect(length).toBeGreaterThanOrEqual(2);
        const lastResponse = subscriber.mock.calls[length - 1][0];
        expect(lastResponse.state).toBe('InProgress');
        expect(lastResponse.payload.dashboard).toMatchObject({
            id,
            permission: 'Viewer',
            ...pick(initialDashboard, 'name', 'kind', 'status'),
        });

        subscription.unsubscribe();
    });

    it('receives error after permission change to `None`', async () => {
        // Step 1. Grant Owner permissions to the current dashboard to `user2`
        const permission = {
            id,
            type: 'UpdateDashboardPermissions',
            permissions: [{ user: otherClient.username, permission: 'Owner' }],
        };
        const permissionResponse = await client.request(permission);
        expect(permissionResponse.state).toBe('Done');

        const subscriber = vi.fn();
        const subscription = otherClient
            .send({ type: 'SubscribeToDashboard', id })
            .subscribe(subscriber);

        // Step 3. Change permissions to current dashboard to `None` for `user2`
        const permissionsResponse = await client.request({
            ...permission,
            permissions: [{ user: otherClient.username, permission: 'None' }],
        });
        expect(permissionsResponse.state).toBe('Done');
        expect(permissionsResponse.payload.type).toBe('PermissionsUpdated');

        // Step 4. Check that `user2` has received subscription error
        await wait();
        expect(subscriber.mock.calls).toHaveLength(2);
        const secondResponse = subscriber.mock.calls[1][0];
        expect(secondResponse.error).toMatchSnapshot();

        subscription.unsubscribe();
    });

    it('unsubscribes from subscription', async () => {
        // Step 1. Subscribe to a dashboard.
        const subscriber = vi.fn();
        const correlationId = generateCorrelationId();
        const subscription$ = client
            .send({ type: 'SubscribeToDashboard', id }, { correlationId })
            .pipe(share());

        const firstResponse = await firstValueFrom(subscription$);
        expect(firstResponse.state).toBe('InProgress');
        // @ts-ignore TODO: remove this ts-ignore after tests migration to grpc
        const { dashboard } = firstResponse.payload as { dashboard: TDashboardItem };

        const subscription = subscription$.subscribe(subscriber);

        // Step 2. Unsubscribe.
        const unsubscribeResponse = await client.request(
            { type: 'Unsubscribe' },
            { correlationId },
        );
        expect(unsubscribeResponse.state).toBe('Done');
        expect(unsubscribeResponse.payload).toMatchSnapshot();

        // Step 3. Update dashboard
        const updatedDashboard = {
            type: 'UpdateDashboard',
            ...pick(dashboard, 'id', 'name', 'status', 'digest'),
            config: 'modified config',
        };
        const updateResponse = await client.request(updatedDashboard);
        expect(updateResponse.state).toBe('Done');

        // Step 4. Wait for another couple of seconds for any late updates
        // and check that we didn't receive any updates at all.
        await wait();
        expect(subscriber.mock.calls).toHaveLength(0);

        subscription.unsubscribe();
    });

    it('receives update after sharing', async () => {
        // Step 1. Subscribe to a dashboard.
        const subscriber = vi.fn();
        const correlationId = generateCorrelationId();
        const subscription$ = client
            .send({ type: 'SubscribeToDashboard', id }, { correlationId })
            .pipe(share());
        const subscription = subscription$.subscribe(subscriber);

        // Step 2. Share dashboard
        const shareResponse = await client.request({
            type: 'UpdateDashboardShareSettings',
            id,
            sharePermission: SharePermission.Viewer,
        });
        expect(shareResponse.state).toBe('Done');

        // Step 3. Wait for another couple of seconds for any late updates
        await wait();

        // Step 4. Check that update has been received
        expect(subscriber.mock.calls).toHaveLength(2);
        const initialDashboardResponse = subscriber.mock.calls[0][0];
        const updateDashboardResponse = subscriber.mock.calls[1][0];
        expect(initialDashboardResponse.payload.dashboard.sharePermission).toBe(
            SharePermission.None,
        );
        expect(updateDashboardResponse.payload.dashboard.sharePermission).toBe(
            SharePermission.Viewer,
        );

        subscription.unsubscribe();
    });

    it('receives updatable list of owners', async () => {
        // Step 1. Subscribe to a dashboard.
        const subscriber = vi.fn();
        const correlationId = generateCorrelationId();
        const subscription$ = client
            .send({ type: 'SubscribeToDashboard', id }, { correlationId })
            .pipe(share());
        const subscription = subscription$.subscribe(subscriber);

        // Step 2. Add another owner
        const permission = {
            id,
            type: 'UpdateDashboardPermissions',
            permissions: [{ user: otherClient.username, permission: 'Owner' }],
        };
        await client.request(permission);

        // Step 3. Wait for another couple of seconds for any late updates
        await wait();

        // Step 4. Check that update has been received
        const { length } = subscriber.mock.calls;
        expect(length).toBeGreaterThanOrEqual(2);
        expect(subscriber.mock.calls[0][0].payload.dashboard.owners).toEqual([
            { user: client.username },
        ]);
        expect(subscriber.mock.calls[length - 1][0].payload.dashboard.owners).toEqual([
            { user: client.username },
            { user: otherClient.username },
        ]);

        subscription.unsubscribe();
    });

    it('receives updatable permissions count as owner', async () => {
        // Step 1. Subscribe to a dashboard.
        const subscriber = vi.fn();
        const correlationId = generateCorrelationId();
        const subscription$ = client
            .send({ type: 'SubscribeToDashboard', id }, { correlationId })
            .pipe(share());
        const subscription = subscription$.subscribe(subscriber);

        // Step 2. Add another users to permissions list
        const permission = {
            id,
            type: 'UpdateDashboardPermissions',
            permissions: [{ user: otherClient.username, permission: 'Viewer' }],
        };
        await client.request(permission);

        // Step 3. Wait for another couple of seconds for any late updates
        await wait();

        // Step 4. Check that update has been received
        expect(subscriber.mock.calls).toHaveLength(2);
        expect(subscriber.mock.calls[0][0].payload.dashboard.permissionsCount).toBe(0);
        expect(subscriber.mock.calls[1][0].payload.dashboard.permissionsCount).toBe(1);

        subscription.unsubscribe();
    });

    it('does not receive permissions count as non-owner', async () => {
        // Step 1. Add another user as Editor
        const permission = {
            id,
            type: 'UpdateDashboardPermissions',
            permissions: [{ user: otherClient.username, permission: 'Editor' }],
        };
        await client.request(permission);

        // Subscribe to dashboard as Viewer user
        const response = await otherClient.request({ type: 'SubscribeToDashboard', id });

        // Step 4. Check that permissionsCount doesn't exist in the response
        expect(response.payload.dashboard.permissionsCount).toBeUndefined();
    });
});
