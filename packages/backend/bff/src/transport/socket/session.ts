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

import { TRpcResponse } from '../../def/rpc.ts';
import { TUserAuthState, TUserName } from '../../def/user.ts';
import { RpcRequestContext } from '../../rpc/context.ts';
import { TRpcSession } from '../../rpc/def.ts';
import { appConfig } from '../../utils/appConfig.ts';
import { TSessionId } from '../../utils/sessionId.ts';

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

    send = (res: TRpcResponse, { logger }: RpcRequestContext): Observable<void> => {
        return new Observable((subscriber) => {
            const responseStr = JSON.stringify(res);

            logger.debug({
                message: 'Sending response',
                length: responseStr.length,
                type: res.payload ? res.payload.type : `error ${res.error.code}`,
            });

            if (this.ws.readyState === this.ws.OPEN) {
                this.ws.send(responseStr, (error: Error | undefined) => {
                    if (error) {
                        logger.error({
                            message: 'Failed to send response',
                            error,
                        });
                        logger.debug({ message: error.stack ?? '' });
                        subscriber.error(error);
                        return;
                    }
                    logger.debug({ message: 'Payload sent successfully' });
                    subscriber.next();
                    subscriber.complete();
                });
            }
        });
    };

    close = ({ logger }: RpcRequestContext): Observable<void> => {
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
