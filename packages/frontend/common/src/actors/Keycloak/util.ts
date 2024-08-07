import type { Nil } from '@common/types';
import { isNil } from 'lodash-es';
import type { Observable } from 'rxjs';
import { EMPTY, from, of } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

// This function is used to execute a function with a lock.
// That help execute the function only once at a time between multiple threads.
export function execFunctionWithLock<Payload>(
    id: string,
    fn: () => Promise<Payload>,
): Observable<Payload> {
    return from(
        // If ifAvailable=true, the lock request will only be granted if it is not already held.
        // If it cannot be granted, the callback will be invoked with null instead of a Lock instance.
        navigator.locks.request(id, { ifAvailable: true }, () => {
            return fn().then((payload) => {
                return { payload };
            });
        }),
    ).pipe(
        mergeMap((result: Nil | { payload: Payload }) => {
            return isNil(result) ? EMPTY : of(result.payload);
        }),
    );
}
