import { EMPTY, interval, map, mergeMap, of, throwError } from 'rxjs';

import { ERpcMethod } from '../../rpc/def.ts';
import { createRpcRoutes } from '../../rpc/utils.ts';
import { appConfig } from '../../utils/appConfig.ts';
import { EGeneralRouteName } from './def.ts';

export const rootRpcRoutes = createRpcRoutes<EGeneralRouteName>({
    [EGeneralRouteName.Ping]: {
        method: ERpcMethod.CALL,
        options: {
            skipAuth: true,
        },
        handler(req) {
            return of({ type: 'Pong' } as const).pipe(
                mergeMap((res) => {
                    if (appConfig.service.stage !== 'production') {
                        if (req.payload.simulateInternalError === true) {
                            return throwError(() => new Error('Simulated Internal Error'));
                        }
                        if (req.payload.simulateTimeout === true) {
                            return interval(appConfig.rpc.timeout + 1_000).pipe(map(() => res));
                        }
                    }
                    return of(res);
                }),
            );
        },
    },
    [EGeneralRouteName.ServerHeartbeat]: {
        method: ERpcMethod.SUBSCRIBE,
        options: {
            skipAuth: true,
        },
        handler() {
            return interval(appConfig.heartbeat.interval).pipe(
                map(() => ({
                    type: 'Heartbeat',
                })),
            );
        },
    },
    [EGeneralRouteName.Heartbeat]: {
        method: ERpcMethod.CALL,
        options: {
            skipAuth: true,
        },
        handler() {
            return EMPTY;
        },
    },
    [EGeneralRouteName.Unsubscribe]: {
        method: ERpcMethod.CALL,
        options: {
            skipAuth: true,
        },
        handler() {
            return of({ type: 'Unsubscribed' } as const);
        },
    },
});
