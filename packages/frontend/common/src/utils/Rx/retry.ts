import type { MonoTypeOperatorFunction, Observable } from 'rxjs';
import { mergeMap, throwError, timer } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { EGrpcErrorCode, GrpcError } from '../../types/GrpcError';

export function createCatchErrorSelector(delay: number) {
    return function <T>(err: Error | GrpcError, caught: Observable<T>) {
        if (
            err.constructor === Error ||
            (err instanceof GrpcError &&
                (err.code === EGrpcErrorCode.UNAVAILABLE || err.code === EGrpcErrorCode.UNKNOWN))
        ) {
            return timer(delay).pipe(mergeMap(() => caught));
        }

        return throwError(err);
    };
}

export function retry<T>(delay: number): MonoTypeOperatorFunction<T> {
    return catchError<T, Observable<T>>(createCatchErrorSelector(delay));
}
