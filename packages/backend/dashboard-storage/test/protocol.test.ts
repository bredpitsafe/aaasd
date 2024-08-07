import { generateTraceId } from '@common/utils';
import { wait } from '@common/utils/src/wait.ts';
import fetch from 'node-fetch';
import { firstValueFrom, fromEvent, fromEventPattern } from 'rxjs';
import { afterAll, describe, expect, it, vi } from 'vitest';
import WebSocket from 'ws';

import { config } from '../src/utils/config.js';
import { BASE_URL, Client, users, WS_ADDRESS } from './client/index.ts';

describe('Protocol', () => {
    const client = new Client();

    afterAll(() => {
        client.close();
    });

    it('healthcheck', async () => {
        const response = await fetch(`http://${BASE_URL}${config.service.httpHealthcheckURL}`);
        expect(await response.text()).toMatchSnapshot();
    });

    it('metrics', async () => {
        const response = await fetch(`http://${BASE_URL}${config.metrics.url}`);
        expect(response.status).toBe(200);
    });

    it('ping', async () => {
        const response = await client.request({ type: 'Ping' });
        expect(response.state).toBe('Done');
        expect(response.payload.type).toBe('Pong');
    });

    it('client heartbeat', async () => {
        const obs$ = client.send({ type: 'Heartbeat' });
        const subscriber = vi.fn();
        const subscription = obs$.subscribe(subscriber);
        await wait();

        expect(subscriber.mock.calls).toHaveLength(0);
        subscription.unsubscribe();
    });

    it('server heartbeat', async () => {
        const obs$ = client.send({ type: 'ServerHeartbeat' });
        const subscriber = vi.fn();
        const subscription = obs$.subscribe(subscriber);
        await wait(2000);

        expect(subscriber.mock.calls.length).toBeGreaterThan(0);
        expect(subscriber.mock.calls[0][0]).toMatchObject({
            state: 'InProgress',
            payload: {
                type: 'Heartbeat',
            },
        });
        subscription.unsubscribe();
    });

    it('traceId', async () => {
        const traceId = generateTraceId();
        const response = await client.request({ type: 'Ping' }, { traceId });
        expect(response.traceId).toBe(traceId);
    });

    it('correlationId', async () => {
        const correlationId = Math.floor(Math.random() * 1000);
        const response = await client.request({ type: 'Ping' }, { correlationId });
        expect(response.correlationId).toBe(correlationId);
    });

    it('unknown message type', async () => {
        const response = await client.request({ type: 'UNKNOWN_MESSAGE' });
        expect(response.error).toMatchSnapshot();
    });

    it('missing traceId', async () => {
        const response = await client.request({ type: 'UNKNOWN_MESSAGE' }, { traceId: undefined });
        expect(response.error).toMatchSnapshot();
    });

    it('missing correlationId', async () => {
        const response = await client.request({ type: 'UNKNOWN_MESSAGE' }, { traceId: undefined });
        expect(response.error).toMatchSnapshot();
    });

    it('non-JSON payload', async () => {
        const ws = new WebSocket(WS_ADDRESS);
        await firstValueFrom(fromEvent(ws, 'open'));
        const handleMessage = (handler: Function) =>
            ws.on('message', (message) => {
                const response = JSON.parse(message.toString());
                handler(response);
            });
        const promise = firstValueFrom<{ state: string; error: object }>(
            fromEventPattern(handleMessage),
        );
        ws.send('NOT_A_JSON');
        const message = await promise;
        expect(message.state).toBe('Done');
        expect(message.error).toMatchSnapshot();
    });

    it('simulate internal error', async () => {
        const response = await client.request({ type: 'Ping', simulateInternalError: true });

        expect(response.error).toMatchSnapshot();
    });

    it('simulate subscription timeout', async () => {
        const authenticatedClient = new Client({ authenticate: true, as: users.user1.username });
        const response = await authenticatedClient.request({ type: 'Ping', simulateTimeout: true });

        expect(response.error).toMatchSnapshot();
    }, 10_000);
});
