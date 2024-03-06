import { interval, map, Observable, startWith } from 'rxjs';

import { createActorObservableBox } from '../../utils/Actors/observable';
import { logger } from '../../utils/Tracing';
import { Binding } from '../../utils/Tracing/Children/Binding';

export type THeartbeat = {
    ping: true;
};
export const sendHeartbeatEnvBox = createActorObservableBox<undefined, THeartbeat>()(
    'SEND_HEARTBEAT',
);

export const WORKER_HEARTBEAT_INTERVAL = 1_000;

export const log = logger.child(new Binding('SendHeartbeat'));
export const sendHeartbeat = (): Observable<THeartbeat> =>
    interval(WORKER_HEARTBEAT_INTERVAL).pipe(
        startWith(undefined),
        map(() => {
            return { ping: true };
        }),
    );
