import { catchError, concat, MonoTypeOperatorFunction, Observable, of, timer } from 'rxjs';
import { switchMap } from 'rxjs/operators';

import type { ValueDescriptor } from '../../types/ValueDescriptor';
import { FailDesc } from '../ValueDescriptor';

export function retryWithPassFailDescriptor<T extends ValueDescriptor<any, any, any>>(
    fail: T['fail'],
    retryTimeout: number,
): MonoTypeOperatorFunction<T> {
    return catchError((err, caught: Observable<T>) =>
        concat(of(FailDesc(fail) as T), timer(retryTimeout).pipe(switchMap(() => caught))),
    );
}
