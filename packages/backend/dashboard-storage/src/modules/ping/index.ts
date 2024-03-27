import { interval, map, Observable, of, throwError } from 'rxjs';

import { TActorRequest } from '../../def/actor.ts';
import { PingRequest } from '../../def/request.ts';
import { PingResponse } from '../../def/response.ts';
import { config } from '../../utils/config.ts';

export function ping(req: TActorRequest<PingRequest>): Observable<PingResponse> {
    const response: PingResponse = { type: 'Pong' };
    if (config.service.stage !== 'production') {
        if (req.payload.simulateInternalError === true) {
            return throwError(() => new Error('Simulated Internal Error'));
        }
        if (req.payload.simulateTimeout === true) {
            return interval(config.subscriptions.timeout + 1_000).pipe(map(() => response));
        }
    }

    return of(response);
}
