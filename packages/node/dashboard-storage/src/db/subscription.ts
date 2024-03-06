import { Observable, repeat, startWith, takeUntil, timer } from 'rxjs';
import { tap } from 'rxjs/operators';

import { EActorName } from '../def/actor.ts';
import { logger } from '../utils/logger.ts';
import { generateTraceId } from '../utils/traceId/index.ts';
import { client } from './postgres/index.ts';

const RESTART_INTERVAL = 1000 * 60 * 60;

export function subscribeToTableUpdates<T>(eventName: string): Observable<T | undefined> {
    const traceId = generateTraceId();
    return client.listen<T>({ eventName, traceId }).pipe(
        startWith(undefined),
        tap({
            complete: () => {
                logger.warn({
                    actor: EActorName.Database,
                    message: `subscribeToTableUpdates completed`,
                    traceId,
                });
            },
            error: (error) => {
                logger.error({
                    actor: EActorName.Database,
                    message: `subscribeToTableUpdates failed`,
                    error,
                    traceId,
                });
            },
        }),
        // Force restart subscription every hour to avoid missing update issues
        takeUntil(timer(RESTART_INTERVAL)),
        repeat(),
    );
}
