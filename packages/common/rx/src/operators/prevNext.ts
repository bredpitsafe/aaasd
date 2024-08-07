import type { Observable, UnaryFunction } from 'rxjs';
import { pipe } from 'rxjs';
import { filter, scan } from 'rxjs/operators';

export function scanPrevNext<T>(): UnaryFunction<Observable<T>, Observable<[T, T]>> {
    return pipe(
        scan<T, Partial<[T, T]>>(([, prev], next) => [prev, next], [undefined, undefined]),
        filter((data): data is [T, T] => data[0] !== undefined && data[1] !== undefined),
    );
}
