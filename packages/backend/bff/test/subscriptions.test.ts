import { generateCorrelationId } from '@backend/utils/src/correlationId.ts';
import { wait } from '@common/utils/src/wait.ts';
import { afterAll, describe, expect, it, vi } from 'vitest';

import { Client } from './client';

describe('Protocol', () => {
    const client = new Client();

    afterAll(() => {
        client.close();
    });

    it('unsubscribe stops subscription', async () => {
        const correlationId = generateCorrelationId();
        const obs$ = client.send({ type: 'ServerHeartbeat' }, { correlationId });
        const subscriber = vi.fn();
        const subscription = obs$.subscribe(subscriber);
        await wait(500);

        const callsLength = subscriber.mock.calls.length;
        expect(callsLength).toBeGreaterThan(0);
        await client.request({ type: 'Unsubscribe' }, { correlationId });
        await wait(500);
        // A number of calls should not increase after unsubscribing
        expect(subscriber.mock.calls.length).toBe(callsLength);

        subscription.unsubscribe();
    });
    it('subscription error stops only relevant subscription', async () => {
        // Generate subscription & run it.
        const correlationId = generateCorrelationId();
        const subscriber = vi.fn();

        const subscription = client
            .send({ type: 'ServerHeartbeat' }, { correlationId })
            .subscribe(subscriber);

        // Wait for some messages to appear in the subscriptions.
        await wait(500);
        const callsLength = subscriber.mock.calls.length;
        expect(callsLength).toBeGreaterThan(0);

        // Simulate error in the other subscription
        const errorResponse = await client.request({ type: 'Ping', simulateInternalError: true });
        expect(errorResponse.error).not.toBeUndefined();

        // Wait a bit more to verify that the subscription still runs
        await wait(500);
        expect(subscriber.mock.calls.length).toBeGreaterThan(callsLength);

        await client.request({ type: 'Unsubscribe' }, { correlationId });

        subscription.unsubscribe();
    });

    // TODO: Not implemented yet
    it.skip('correlationId collision causes a subscription error (except Unsubscribe)', async () => {
        const correlationId = generateCorrelationId();
        const subscription = client
            .send({ type: 'ServerHeartbeat' }, { correlationId })
            .subscribe();

        const response = await client.request({ type: 'Ping' }, { correlationId });

        expect(response.error).not.toBeUndefined();
        expect(response.error).toMatchSnapshot();

        await client.request({ type: 'Unsubscribe' }, { correlationId });
        subscription.unsubscribe();
    });
});
