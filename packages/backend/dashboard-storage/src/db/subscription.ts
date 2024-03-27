import { generateTraceId } from '@backend/utils/src/traceId/index.ts';
import { Observable, startWith } from 'rxjs';
import { shareReplay, tap } from 'rxjs/operators';

import { EActorName } from '../def/actor.ts';
import { logger } from '../utils/logger.ts';
import { client } from './postgres/index.ts';

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
        shareReplay({ bufferSize: 1, refCount: true }),
    );
}
