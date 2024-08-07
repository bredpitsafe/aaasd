import usersList from '@backend/oauth-mock-server/data/users.json';
import { generateTraceId } from '@common/utils';
import { isNil, keyBy } from 'lodash-es';
import type { Subscriber } from 'rxjs';
import { firstValueFrom, Observable } from 'rxjs';
import WebSocket from 'ws';

import type { Response } from '../../src/def/response.js';
import { generateCorrelationId, getToken } from './authentication.ts';

export const BASE_URL = 'localhost:8100';
export const WS_ADDRESS = `ws://${BASE_URL}/ws`;
export const users = keyBy(usersList, 'username');

export class Client {
    private ws: WebSocket;
    private requests: Map<number, Subscriber<unknown>>;
    private open: Promise<void>;
    public username: string | undefined;
    constructor({ authenticate = false, as = users.user1.username } = {}) {
        this.ws = new WebSocket(WS_ADDRESS);
        this.requests = new Map();
        this.username = authenticate ? as : undefined;
        this.open = new Promise((resolve, reject) => {
            // eslint-disable-next-line @typescript-eslint/no-misused-promises
            this.ws.once('open', async () => {
                if (authenticate === true) {
                    const token = await getToken(as || users.user1.username);
                    const response = await firstValueFrom(
                        this.send({ type: 'Authenticate', bearerToken: token }, { skipOpen: true }),
                    );
                    if ('error' in response && !isNil(response.error)) {
                        reject(response.error);
                        return;
                    }
                }

                resolve();
            });
        });

        this.ws.on('message', (message) => {
            const response = JSON.parse(message.toString());
            const subscriber = this.requests.get(response.correlationId);
            if (subscriber === undefined) {
                return;
            }

            subscriber.next(response);
        });

        this.ws.on('close', () => {
            for (const [, subscriber] of this.requests) {
                subscriber.complete();
            }
        });

        this.ws.on('error', (err) => {
            for (const [, subscriber] of this.requests) {
                subscriber.error(err);
            }
        });
    }

    send(
        payload: object,
        {
            traceId = generateTraceId(),
            correlationId = generateCorrelationId(),
            timestamp = new Date().toISOString(),
            skipOpen = false,
        } = {},
    ): Observable<Response> {
        const request = { payload, traceId, correlationId, timestamp };
        void (skipOpen ? Promise.resolve() : this.open).then(() =>
            this.ws.send(JSON.stringify(request)),
        );
        return new Observable((subscriber) => {
            this.requests.set(correlationId, subscriber);

            return () => {
                this.requests.delete(correlationId);
            };
        });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    request(payload: object, options = {}): Promise<any> {
        return firstValueFrom(this.send(payload, options));
    }

    close() {
        this.ws.close();
    }
}
