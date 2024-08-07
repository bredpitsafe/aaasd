import { generateTraceId } from '@common/utils';
import type { Observable } from 'rxjs';
import { startWith } from 'rxjs';
import { shareReplay, tap } from 'rxjs/operators';

import { EActorName } from '../def/actor.ts';
import { defaultLogger } from '../utils/logger.ts';
import { client } from './postgres/index.ts';

export function subscribeToTableUpdates<T>(eventName: string): Observable<T | undefined> {
    const traceId = generateTraceId();

    return client.listen<T>({ eventName, traceId }).pipe(
        startWith(undefined),
        tap({
            complete: () => {
                defaultLogger.warn({
                    actor: EActorName.Database,
                    message: `subscribeToTableUpdates completed`,
                    traceId,
                });
            },
            error: (error) => {
                defaultLogger.error({
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
