import { defer, Observable } from 'rxjs';
import { finalize, tap } from 'rxjs/operators';

export function finalizeWithLastValue<T>(callback: (value: undefined | T) => void) {
    return (source: Observable<T>): ReturnType<typeof defer> =>
        defer(() => {
            let lastValue: undefined | T;
            return source.pipe(
                tap((value) => (lastValue = value)),
                finalize(() => callback(lastValue)),
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
