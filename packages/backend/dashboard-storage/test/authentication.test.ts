import { wait } from '@common/utils/src/wait.js';
import { firstValueFrom, skip } from 'rxjs';
import { afterAll, describe, expect, it, vi } from 'vitest';

import { getToken } from './client/authentication.js';
import { Client, users } from './client/index.js';

describe('Authentication', () => {
    const client = new Client();

    afterAll(() => {
        client.close();
    });

    it('successful', async () => {
        const token = await getToken(users.user1.username);
        const response = await client.request({ type: 'Authenticate', bearerToken: token });
        expect(response.error).toBeUndefined();
        expect(response.state).toBe('Done');
        expect(response.payload).toMatchSnapshot();
    });

    it('failed (no user)', async () => {
        const token = await getToken('unknown_user');
        const response = await client.request({ type: 'Authenticate', bearerToken: token });
        expect(response.error).not.toBeUndefined();

        expect(response.error).toMatchSnapshot();
    });

    it('failed (no token)', async () => {
        const response = await client.request({ type: 'Authenticate', bearerToken: undefined });
        expect(response.error).not.toBeUndefined();

        expect(response.error).toMatchSnapshot();
    });

    it('failed (unknown token)', async () => {
        const response = await client.request({
            type: 'Authenticate',
            bearerToken: 'unknown_token',
        });
        expect(response.error).not.toBeUndefined();

        expect(response.error).toMatchSnapshot();
    });

    it('failed (expired token)', async () => {
        const token = await getToken(users.short_exp.username);
        await wait(users.short_exp.exp * 1000);
        const response = await client.request({ type: 'Authenticate', bearerToken: token });

        expect(response.error).toMatchSnapshot();
    });

    it('authentication expires with an active subscription', async () => {
        const authenticatedClient = new Client({
            authenticate: true,
            as: users.short_exp.username,
        });
        const response = await firstValueFrom(
            authenticatedClient.send({ type: 'SubscribeToDashboardsList' }).pipe(skip(1)),
        );

        expect(response.error).toMatchSnapshot();
        authenticatedClient.close();
    });

    it('logout (non-authenticated socket)', async () => {
        const response = await client.request({ type: 'Logout' });
        expect(response).toMatchObject({
            state: 'Done',
            payload: {
                type: 'LoggedOut',
            },
        });
    });

    it('logout stops active subscription', async () => {
        const authenticatedClient = new Client({ authenticate: true });
        const subscriber = vi.fn();
        const subscription = authenticatedClient
            .send({ type: 'SubscribeToDashboardsList' })
            .subscribe(subscriber);

        await wait();
        const response = await authenticatedClient.request({ type: 'Logout' });
        expect(response).toMatchObject({
            state: 'Done',
            payload: {
                type: 'LoggedOut',
            },
        });

        await wait(1000);

        expect(subscriber.mock.calls).toHaveLength(2);
        const lastResponse = subscriber.mock.calls[1][0];
        expect(lastResponse.error).toMatchSnapshot();

        subscription.unsubscribe();
    });

    it('logout closes socket', async () => {
        const authenticatedClient = new Client({ authenticate: true });
        const subscription = authenticatedClient
            .send({ type: 'SubscribeToDashboardsList' })
            .subscribe();

        await wait(1000);
        await authenticatedClient.request({ type: 'Logout' });
        await wait(1100);

        expect(subscription.closed).toBe(true);
    });

    it('authentication expiration closes socket with subscription error', async () => {
        const authenticatedClient = new Client({
            authenticate: true,
            as: users.short_exp.username,
        });
        const subscriber = vi.fn();
        const subscription = authenticatedClient
            .send({ type: 'SubscribeToDashboardsList' })
            .subscribe(subscriber);

        await wait(users.short_exp.exp * 1000 + 100);

        expect(subscriber.mock.calls).toHaveLength(2);
        expect(subscriber.mock.calls[1][0].error).not.toBeUndefined();
        expect(subscriber.mock.calls[1][0].error).toMatchSnapshot();

        await wait(1000);

        expect(subscription.closed).toBe(true);
    });
});
