import { generateCorrelationId } from '@backend/utils/src/correlationId.ts';
import { generateTraceId } from '@common/utils';
import { wait } from '@common/utils/src/wait.ts';
import { omit } from 'lodash-es';
import fetch from 'node-fetch';
import { firstValueFrom, fromEvent, fromEventPattern } from 'rxjs';
import { afterAll, describe, expect, it, vi } from 'vitest';
import WebSocket from 'ws';

import type { TStageName } from '../src/def/stages.ts';
import { RpcError } from '../src/rpc/errors.ts';
import { BASE_URL, Client, users, WS_ADDRESS } from './client/index.ts';

describe('Protocol', () => {
    const client = new Client();

    afterAll(() => {
        client.close();
    });

    it('healthcheck', async () => {
        const response = await fetch(`http://${BASE_URL}/healthcheck`);
        expect(await response.text()).toMatchSnapshot();
    });

    it('metrics', async () => {
        const response = await fetch(`http://${BASE_URL}/metrics`);
        expect(response.status).toBe(200);
    });

    it('ping', async () => {
        const response = await client.request({ type: 'Ping' });
        expect(response.state).toBe('Done');
        expect(response.payload?.type).toBe('Pong');
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
        const correlationId = generateCorrelationId();
        const obs$ = client.send({ type: 'ServerHeartbeat' }, { correlationId });
        const subscriber = vi.fn();
        const subscription = obs$.subscribe(subscriber);
        await wait(500);

        expect(subscriber.mock.calls.length).toBeGreaterThan(0);
        expect(subscriber.mock.calls[0][0]).toMatchObject({
            state: 'InProgress',
            payload: {
                type: 'Heartbeat',
            },
        });

        subscription.unsubscribe();
        await client.request({ type: 'Unsubscribe' }, { correlationId });
    });

    it('traceId', async () => {
        const traceId = generateTraceId();
        const response = await client.request({ type: 'Ping' }, { traceId });
        expect(response.traceId).toBe(traceId);
    });

    it('correlationId', async () => {
        const correlationId = generateCorrelationId();
        const response = await client.request({ type: 'Ping' }, { correlationId });
        expect(response.correlationId).toBe(correlationId);
    });

    it('unknown message type', async () => {
        // Intentionally send incorrect message, therefore ignore TS error
        // @ts-ignore
        const response = await client.request({ type: 'UNKNOWN_MESSAGE' });
        expect(response.error).toMatchSnapshot();
    });

    it('missing traceId', async () => {
        const response = await client.request({ type: 'Ping' }, { traceId: undefined });
        expect(response.error).toMatchSnapshot();
    });

    it('missing timestamp', async () => {
        const response = await client.request({ type: 'Ping' }, { timestamp: undefined });
        expect(response.error).toMatchSnapshot();
    });

    it('missing payload', async () => {
        // Intentionally send incorrect payload, therefore ignore TS error
        // @ts-ignore
        const response = await client.request(undefined, { timestamp: undefined });
        expect(response.error).toMatchSnapshot();
    });

    it('missing correlationId', async () => {
        try {
            await client.request({ type: 'Ping' }, { correlationId: undefined });
            // Client is not able to resolve a request. It'll throw an error upon encountering unknown response (with non-matching correlationId).
        } catch (err) {
            if (err instanceof RpcError && 'response' in err.args) {
                expect(
                    omit(err.args.response as object, ['traceId', 'correlationId', 'timestamp']),
                ).toMatchSnapshot();
                return;
            }
            throw err;
        }
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
        const response = await client.request({ type: 'Ping', simulateTimeout: true });

        expect(response.error).toMatchSnapshot();
    }, 10_000);

    it('missing `requestStage` parameter', async () => {
        const authenticatedClient = new Client({ authenticate: true, as: users.user1.username });
        // Intentionally ignore TS error (missing field) because that what we're testing here
        // @ts-ignore
        const response = await authenticatedClient.request({
            type: 'SubscribeToStmBalances',
        });

        expect(response.error).toMatchSnapshot();
    });

    it('incorrect `requestStage` parameter (completely invalid)', async () => {
        const authenticatedClient = new Client({ authenticate: true, as: users.user1.username });
        const response = await authenticatedClient.request({
            type: 'SubscribeToStmBalances',
            requestStage: 'some_fake_stage' as TStageName,
        });

        expect(response.error).toMatchSnapshot();
    });

    it('incorrect `requestStage` parameter (stage does not support service)', async () => {
        const authenticatedClient = new Client({ authenticate: true, as: users.user1.username });
        const response = await authenticatedClient.request({
            type: 'SubscribeToStmBalances',
            requestStage: 'authz' as TStageName,
        });

        expect(response.error).toMatchSnapshot();
    });
});
