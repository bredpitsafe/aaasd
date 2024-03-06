import { interval, map, NEVER, Observable } from 'rxjs';

import { HeartbeatResponse } from '../../def/response.ts';
import { config } from '../../utils/config.ts';

export const receiveHeartbeat = (): Observable<never> => {
    return NEVER;
};
export const produceHeartbeat = (): Observable<HeartbeatResponse> => {
    return interval(config.heartbeat.interval).pipe(
        map(() => ({
            type: 'Heartbeat',
        })),
    );
};
