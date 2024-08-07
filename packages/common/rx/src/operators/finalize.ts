import type { Observable } from 'rxjs';
import { defer } from 'rxjs';
import { finalize, tap } from 'rxjs/operators';

export function finalizeWithLastValue<T, E extends Error>(
    callback: (value: undefined | T, error?: E) => void,
) {
    return (source: Observable<T>): ReturnType<typeof defer> =>
        defer(() => {
            let hasValue = false;
            let error: undefined | E;
            let value: undefined | T;
            return source.pipe(
                tap({
                    next: (v) => {
                        hasValue = true;
                        value = v;
                    },
                    error: (err) => (error = err as E),
                }),
                finalize(() => hasValue && callback(value, error)),
            );
        });
}

export function finalizeOnlyWithError<Err extends Error>(callback: (value: Err) => void) {
    return (source: Observable<unknown>): ReturnType<typeof defer> =>
        defer(() => {
            let error: Err;
            return source.pipe(
                tap({ error: (err) => (error = err) }),
                finalize(() => error && callback(error)),
            );
        });
}

export function finalizeOnlyWithoutError(callback: () => void) {
    return (source: Observable<unknown>): ReturnType<typeof defer> =>
        defer(() => {
            let error: undefined | unknown = undefined;
            return source.pipe(
                tap({ error: (err) => (error = err) }),
                finalize(() => error === undefined && callback()),
            );
        });
}
