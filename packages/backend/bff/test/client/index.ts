import usersList from '@backend/oauth-mock-server/data/users.json';
import { generateCorrelationId } from '@backend/utils/src/correlationId.ts';
import { generateTraceId } from '@common/utils';
import { isNil, keyBy } from 'lodash-es';
import type { Subscriber } from 'rxjs';
import { firstValueFrom, Observable } from 'rxjs';
import WebSocket from 'ws';

import type { TRpcRequest, TRpcRequestBody, TRpcResponse } from '../../src/def/rpc.ts';
import { ERpcErrorCode } from '../../src/def/rpc.ts';
import { RpcError } from '../../src/rpc/errors.ts';
import { getToken } from './authentication.ts';

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
            this.ws.once('open', async () => {
                if (authenticate) {
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
            const subscriber = this.requests.get(response?.correlationId);
            // Fail all clients if unknown socket message has been received
            if (isNil(subscriber)) {
                this.requests.forEach((subscriber) => {
                    subscriber.error(
                        new RpcError(
                            ERpcErrorCode.OUT_OF_RANGE,
                            'unexpected socket message: \n\n' + JSON.stringify(response),
                            {
                                response,
                            },
                        ),
                    );
                });
                return;
            }

            this.requests.get(response?.correlationId)?.next(response);
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
        payload: TRpcRequest['payload'],
        options?: Partial<Omit<TRpcRequestBody<unknown>, 'payload'> & { skipOpen: boolean }>,
    ): Observable<TRpcResponse> {
        const traceId =
            !isNil(options) && 'traceId' in options ? options.traceId : generateTraceId();
        const correlationId =
            !isNil(options) && 'correlationId' in options
                ? options.correlationId
                : generateCorrelationId();
        const timestamp =
            !isNil(options) && 'timestamp' in options
                ? options.timestamp
                : new Date().toISOString();
        const skipOpen = !isNil(options) && 'skipOpen' in options ? options.skipOpen : false;

        const request = { payload, traceId, correlationId, timestamp };
        const requestKey = correlationId ?? generateCorrelationId();
        void (skipOpen ? Promise.resolve() : this.open).then(() =>
            this.ws.send(JSON.stringify(request)),
        );
        return new Observable((subscriber) => {
            this.requests.set(requestKey, subscriber);

            return () => {
                this.requests.delete(requestKey);
            };
        });
    }

    request(...args: Parameters<typeof this.send>): Promise<TRpcResponse> {
        return firstValueFrom(this.send(...args));
    }

    close() {
        this.ws.close();
    }
}
