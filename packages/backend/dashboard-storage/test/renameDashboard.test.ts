import { wait } from '@common/utils/src/wait.js';
import type { TSubscribeToDashboardResponse } from '@grpc-schemas/dashboard_storage-api-sdk/services/dashboard_storage/v1/dashboard_api.js';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type {
    RenameDashboardRequest,
    SubscribeToDashboardRequest,
    UpdateDashboardDraftRequest,
    UpdateDashboardPermissionsRequest,
} from '../src/def/request.ts';
import { Permission } from '../src/def/response.ts';
import { Client, users } from './client/index.js';
import initialDashboard from './fixtures/dashboard.json';

describe('RenameDashboard', () => {
    const client: Client = new Client({ authenticate: true });
    const client2: Client = new Client({ authenticate: true, as: users.user2.username });

    const newName = 'New Dashboard Name';
    let renameRequest: RenameDashboardRequest | undefined = undefined;

    beforeEach(async () => {
        const createDashboardResponse = await client.request(initialDashboard);
        renameRequest = {
            type: 'RenameDashboard',
            id: createDashboardResponse.payload.id,
            name: newName,
        };
    });

    it('renames dashboard as owner', async () => {
        const response = await client.request(renameRequest!);
        expect(response.state).toBe('Done');
        expect(response.payload.type).toBe('DashboardRenamed');

        const fetchResponse = await client.request({
            type: 'SubscribeToDashboard',
            id: renameRequest!.id,
        });
        expect(fetchResponse.payload.dashboard.name).toBe(renameRequest!.name);
    });

    it('fails to rename other user`s dashboard', async () => {
        const response = await client2.request(renameRequest!);
        expect(response.error).not.toBeUndefined();
        expect(response.error).toMatchSnapshot();
    });

    it('fails to rename dashboard with Viewer permissions', async () => {
        // Step 1. Make `user2` a Viewer.
        const updatePermissionRequest: UpdateDashboardPermissionsRequest = {
            type: 'UpdateDashboardPermissions',
            id: renameRequest!.id,
            permissions: [
                {
                    user: client2.username!,
                    // @ts-ignore TODO: remove this ts-ignore after tests migration to grpc
                    permission: Permission.Viewer,
                },
            ],
        };
        await client.request(updatePermissionRequest);

        // Step 2. Check that Viewer cannot rename dashboard
        const response = await client2.request(renameRequest!);
        expect(response.error).not.toBeUndefined();
        expect(response.error).toMatchSnapshot();
    });

    it('keeps dashboard draft after rename', async () => {
        // Step 1. Create draft.
        const updateDashboardDraftRequest: UpdateDashboardDraftRequest = {
            type: 'UpdateDashboardDraft',
            id: renameRequest!.id,
            config: 'some config draft',
        };
        await client.request(updateDashboardDraftRequest);

        // Step 2. Rename dashboard
        const response = await client.request(renameRequest!);
        expect(response.payload.type).toBe('DashboardRenamed');

        // Step 3. Check that draft still exists.
        const dashboardRequest: SubscribeToDashboardRequest = {
            type: 'SubscribeToDashboard',
            id: renameRequest!.id,
        };
        const dashboardResponse: { payload: TSubscribeToDashboardResponse } =
            await client.request(dashboardRequest);
        expect(dashboardResponse.payload.dashboard.hasDraft).toBe(true);
    });

    it('updates dashboard name in subscription after rename', async () => {
        // Step 1. Subscribe to dashboard.
        const dashboard$ = client.send({ type: 'SubscribeToDashboard', id: renameRequest!.id });
        const subscriber = vi.fn();
        const subscription = dashboard$.subscribe(subscriber);
        await wait();

        // Step 2. Rename dashboard
        const response = await client.request(renameRequest!);
        expect(response.payload.type).toBe('DashboardRenamed');
        await wait();

        // Step 3. Check that subscription has been updated with a new name

        expect(subscriber.mock.calls).toHaveLength(2);
        const firstResponse = subscriber.mock.calls[0][0];
        expect(firstResponse.payload.dashboard.name).toBe(initialDashboard.name);

        const secondResponse = subscriber.mock.calls[1][0];
        expect(secondResponse.payload.dashboard.name).toBe(renameRequest!.name);

        subscription.unsubscribe();
    });

    it('updates dashboard name in list subscription after rename', async () => {
        // Step 1. Subscribe to dashboard.
        const list$ = client.send({ type: 'SubscribeToDashboardsList' });
        const subscriber = vi.fn();
        const subscription = list$.subscribe(subscriber);
        await wait();

        // Step 2. Rename dashboard
        const response = await client.request(renameRequest!);
        expect(response.payload.type).toBe('DashboardRenamed');
        await wait();

        // Step 3. Check that subscription has been updated with a new name

        expect(subscriber.mock.calls).toHaveLength(2);
        const firstResponse = subscriber.mock.calls[0][0];
        expect(
            firstResponse.payload.list.find((item: { id: string }) => item.id === renameRequest!.id)
                .name,
        ).toBe(initialDashboard.name);

        const secondResponse = subscriber.mock.calls[1][0];
        expect(
            secondResponse.payload.list.find(
                (item: { id: string }) => item.id === renameRequest!.id,
            ).name,
        ).toBe(renameRequest!.name);

        subscription.unsubscribe();
    });

    it('fails to rename dashboard if its name will not be changed', async () => {
        const response = await client.request({ ...renameRequest, name: initialDashboard.name });
        expect(response.error).not.toBeUndefined();
        expect(response.error).toMatchSnapshot();
    });
});
