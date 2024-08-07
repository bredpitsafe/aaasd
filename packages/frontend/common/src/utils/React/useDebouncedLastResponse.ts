import type { Milliseconds } from '@common/types';
import { isEqual, isNil } from 'lodash-es';
import { useMemo, useRef } from 'react';
import type { Observable } from 'rxjs';
import { firstValueFrom, from, isObservable, Subject, timer } from 'rxjs';
import { distinctUntilChanged, switchMap, tap } from 'rxjs/operators';

import { Defer } from '../Defer';
import { useFunction } from './useFunction';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useDebouncedLastResponse<TParameters extends any[], TReturnValue>(
    handler: (...args: TParameters) => Observable<TReturnValue> | Promise<TReturnValue>,
    delayMs = 0 as Milliseconds,
): (...args: TParameters) => Promise<TReturnValue> {
    const lastDefer = useRef<Defer<TReturnValue> | undefined>();
    const nextValueSubject = useMemo(() => new Subject<TParameters>(), []);
    const obs$ = useMemo<Observable<TReturnValue>>(
        () =>
            nextValueSubject.pipe(
                distinctUntilChanged(isEqual),
                switchMap((args: TParameters) =>
                    timer(delayMs).pipe(
                        switchMap(() => {
                            const result = handler(...args);

                            return isObservable(result) ? result : from(result);
                        }),
                    ),
                ),
                tap(() => (lastDefer.current = undefined)),
            ),
        [handler, delayMs, nextValueSubject],
    );

    return useFunction(async (...args: TParameters): Promise<TReturnValue> => {
        if (!isNil(lastDefer.current)) {
            const promise = lastDefer.current.promise;
            nextValueSubject.next(args);
            return promise;
        }

        const defer = new Defer<TReturnValue>();
        lastDefer.current = defer;

        firstValueFrom(obs$).then(defer.resolve, defer.reject);

        nextValueSubject.next(args);

        return defer.promise;
    });
}
