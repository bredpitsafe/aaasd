import { isNil } from 'lodash-es';
import {
    BehaviorSubject,
    catchError,
    EMPTY,
    map,
    mergeMap,
    Observable,
    of,
    startWith,
    tap,
    timer,
} from 'rxjs';
import type WebSocket from 'ws';

import type { TRpcResponse, TRpcRouteName } from '../../def/rpc.ts';
import type { TUserAuthState, TUserName } from '../../def/user.ts';
import type { RpcRequestContext } from '../../rpc/context.ts';
import type { TRpcSession } from '../../rpc/def.ts';
import { isErrorResponse } from '../../rpc/utils.ts';
import { appConfig } from '../../utils/appConfig.ts';
import type { TSessionId } from '../../utils/sessionId.ts';

type TSessionState = {
    auth?: TUserAuthState;
};

export class SocketSession implements TRpcSession {
    public id: TSessionId;
    private ws: WebSocket;
    private state$ = new BehaviorSubject<TSessionState>({});

    constructor(id: TSessionId, ws: WebSocket) {
        this.id = id;
        this.ws = ws;
    }

    authenticate = (authState: TUserAuthState): void => {
        this.state$.next({
            ...this.state$.value,
            auth: authState,
        });
    };

    isAuthenticated$ = this.state$.pipe(
        mergeMap((state) => {
            return timer(appConfig.authentication.checkExpirationInterval).pipe(
                startWith(this.isAuthenticated(state)),
                map(() => this.isAuthenticated(state)),
            );
        }),
    );

    deauthenticate(): void {
        this.state$.next({
            ...this.state$.value,
            auth: undefined,
        });
    }

    getUserName(): TUserName | undefined {
        return this.getAuthState()?.username;
    }

    getAuthState(): TUserAuthState | undefined {
        return this.state$.value.auth;
    }

    handleClose = (): void => {
        this.deauthenticate();
    };

    getType(res: TRpcResponse): string {
        if (isErrorResponse(res)) return `error ${res.error?.code}`;
        return res?.payload?.type || 'UNCAUGHT EXCEPTION TYPE';
    }

    send = <T extends TRpcRouteName>(
        res: TRpcResponse,
        ctx?: RpcRequestContext<T>,
    ): Observable<void> => {
        return new Observable((subscriber) => {
            const responseStr = JSON.stringify(res);

            ctx?.logger.debug({
                message: 'Sending response',
                length: responseStr.length,
                type: this.getType(res),
            });

            if (this.ws.readyState === this.ws.OPEN) {
                this.ws.send(responseStr, (error: Error | undefined) => {
                    if (error) {
                        ctx?.logger.error({
                            message: 'Failed to send response',
                            error,
                        });
                        ctx?.logger.debug({ message: error.stack ?? '' });

                        subscriber.error(error);
                        return;
                    }
                    ctx?.logger.debug({ message: 'Payload sent successfully' });
                    subscriber.next();
                    subscriber.complete();
                });
            }
        });
    };

    close = <T extends TRpcRouteName>({ logger }: RpcRequestContext<T>): Observable<void> => {
        return of(undefined).pipe(
            tap(() => {
                logger.debug({
                    message: 'Closing socket by internal command',
                });

                this.ws.close();
            }),
            catchError((error: unknown) => {
                logger.error({
                    message: 'Failed to close socket',
                    error,
                });
                logger.debug({ message: (error as Error).stack ?? '' });
                return EMPTY;
            }),
        );
    };

    private isAuthenticated(state$: TSessionState): boolean {
        const { auth } = state$;
        return !isNil(auth) && auth.exp.getTime() > new Date().getTime();
    }
}
