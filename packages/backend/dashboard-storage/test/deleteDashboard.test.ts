import { wait } from '@common/utils/src/wait.js';
import { afterAll, describe, expect, it, vi } from 'vitest';

import { SharePermission } from '../src/def/response.js';
import { Client, users } from './client/index.js';
import dashboard from './fixtures/dashboard.json';

describe('DeleteDashboard', () => {
    const client: Client = new Client({ authenticate: true });
    const otherClient: Client = new Client({ authenticate: true, as: users.user2.username });

    it('deletes own dashboard', async () => {
        const { id } = (await client.request(dashboard)).payload;
        expect(id).not.toBeUndefined();

        const list$ = client.send({ type: 'SubscribeToDashboardsList' });
        const subscriber = vi.fn();
        const subscription = list$.subscribe(subscriber);

        const response = await client.request({ type: 'DeleteDashboard', id });
        expect(response.state).toBe('Done');
        expect(response.payload.type).toBe('DashboardDeleted');

        await wait();
        expect(subscriber.mock.calls).toHaveLength(2);
        const firstResponse = subscriber.mock.calls[0][0];
        expect(
            firstResponse.payload.list.find((item: { id: string }) => item.id === id),
        ).not.toBeUndefined();

        const secondResponse = subscriber.mock.calls[1][0];
        expect(
            secondResponse.payload.list.find((item: { id: string }) => item.id === id),
        ).toBeUndefined();

        subscription.unsubscribe();
    });

    it('deletes dashboard from list after sharing', async () => {
        const { id } = (await client.request(dashboard)).payload;
        const list$ = client.send({ type: 'SubscribeToDashboardsList' });
        const subscriber = vi.fn();
        const subscription = list$.subscribe(subscriber);

        const response = await client.request({ type: 'DeleteDashboard', id });
        expect(response.state).toBe('Done');

        await wait();
        expect(subscriber.mock.calls).toHaveLength(2);
        const firstResponse = subscriber.mock.calls[0][0];
        const secondResponse = subscriber.mock.calls[1][0];
        expect(
            firstResponse.payload.list.find((item: { id: string }) => item.id === id),
        ).toMatchObject({
            id,
        });
        expect(
            secondResponse.payload.list.find((item: { id: string }) => item.id === id),
        ).toBeUndefined();

        subscription.unsubscribe();
    });

    it('fails to delete other user`s dashboard', async () => {
        const { id } = (await client.request(dashboard)).payload;
        expect(id).not.toBeUndefined();

        const response = await otherClient.request({ type: 'DeleteDashboard', id });

        expect(response.error).toMatchSnapshot();
    });

    it('fails to delete already deleted dashboard', async () => {
        const { id } = (await client.request(dashboard)).payload;
        expect(id).not.toBeUndefined();

        const response = await client.request({ type: 'DeleteDashboard', id });
        expect(response.state).toBe('Done');

        const secondResponse = await client.request({ type: 'DeleteDashboard', id });
        expect(secondResponse.error).toMatchSnapshot();
    });

    // This test case doesn't work for now (as expected).
    it.skip('deletes shared dashboard from anyone', async () => {
        // Create dashboard
        const { id } = (await client.request(dashboard)).payload;

        // Share dashboard to other users
        await client.request({
            type: 'UpdateDashboardShareSettings',
            id,
            sharePermission: SharePermission.Viewer,
        });

        // Subscribe to dashboard as other user
        const dashboard$ = otherClient.send({
            type: 'SubscribeToDashboard',
            id,
        });
        const subscriber = vi.fn();
        const subscription = dashboard$.subscribe(subscriber);

        await wait();

        // Unshare dashboard
        await client.request({
            type: 'DeleteDashboard',
            id,
        });

        await wait();
        // Check that subscription has ended with error
        expect(subscriber.mock.calls).toHaveLength(2);
        const firstResponse = subscriber.mock.calls[0][0];
        const secondResponse = subscriber.mock.calls[1][0];
        expect(firstResponse.state).toBe('InProgress');
        expect(secondResponse.state).toBe('Done');
        expect(secondResponse.error).toMatchSnapshot();

        subscription.unsubscribe();
    });

    afterAll(() => {
        client.close();
        otherClient.close();
    });
});
