import { once } from 'lodash-es';
import { defer, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

export function tapOnce<T>(fn: (value: T) => unknown) {
    return (source: Observable<T>): Observable<T> =>
        defer(() => {
            const onceFn = once((payload: T) => fn(payload));
            return source.pipe(tap(onceFn));
        });
}
