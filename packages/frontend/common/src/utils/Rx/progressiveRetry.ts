import { isFunction, isUndefined } from 'lodash-es';
import type { MonoTypeOperatorFunction, Observable } from 'rxjs';
import { concat, EMPTY, of, pipe, timer } from 'rxjs';
import { catchError, first, map, switchMap, tap } from 'rxjs/operators';

import { documentVisibilityState$ } from '../observable/documentVisibilityState.ts';
import { convertErrToGrpcFail } from '../ValueDescriptor/Fails.ts';
import type { TValueDescriptor2 } from '../ValueDescriptor/types.ts';
import {
    createUnsyncedValueDescriptor,
    isSyncedValueDescriptor,
    isValueDescriptor,
} from '../ValueDescriptor/utils';

export type TProgressiveRetryConfig<T> = {
    initialInterval?: number;
    maxRetries?: number;
    maxInterval?: number;
    backoffDelay?: (iteration: number, initialInterval: number) => number;
    needRetry?: (error: any, attempt: number) => boolean;
    beforeRetry?: (error: any, attempt: number) => Observable<T>;
};

export const RETRY_STRATEGY = {
    EXPONENTIAL: (iteration, initialInterval) => {
        return Math.pow(2, iteration) * initialInterval + (Math.random() * initialInterval) / 2;
    },
    LINEAR: (iteration, initialInterval) => {
        return iteration * initialInterval + (Math.random() * initialInterval) / 2;
    },
    STATIC: (_, initialInterval) => {
        return initialInterval + (Math.random() * initialInterval) / 2;
    },
} satisfies Record<string, (iteration: number, initialInterval: number) => number>;

const DEFAULT_PROGRESSIVE_RETRY_CONFIG = {
    initialInterval: 3_000,
    backoffDelay: RETRY_STRATEGY.LINEAR,
    maxInterval: 60_000,
} as const;

export function progressiveRetry<T>(
    config?: Partial<TProgressiveRetryConfig<T>>,
): MonoTypeOperatorFunction<T> {
    const { maxRetries, maxInterval, initialInterval, backoffDelay, needRetry, beforeRetry } = {
        ...DEFAULT_PROGRESSIVE_RETRY_CONFIG,
        ...config,
    };
    let attempt = 0;

    return pipe(
        tap((vd) => {
            if (!isValueDescriptor(vd) || isSyncedValueDescriptor(vd)) {
                attempt = 0;
            }
        }),
        catchError((err, caught) => {
            attempt++;

            if (
                // Error stops retry
                (isFunction(needRetry) && !needRetry(err, attempt)) ||
                // If `maxRetries` is set & we're out of attempts, throw original error
                (!isUndefined(maxRetries) && attempt > maxRetries)
            ) {
                throw err;
            }

            return concat(
                isFunction(beforeRetry) ? beforeRetry(err, attempt) : EMPTY,
                documentVisibilityState$.pipe(
                    first((visible) => visible),
                    map(() => attempt),
                    switchMap((attempt) => {
                        // Calculate next delay depending on current attempt number
                        const delayStrategy = backoffDelay ?? RETRY_STRATEGY.LINEAR;
                        const currentInterval = delayStrategy(attempt, initialInterval);

                        const delay = isUndefined(maxInterval)
                            ? currentInterval
                            : Math.min(currentInterval, maxInterval);

                        return timer(delay).pipe(switchMap(() => caught));
                    }),
                ),
            );
        }),
    );
}

export function progressiveRetryValueDescriptor<T extends TValueDescriptor2<any>>(
    config?: Partial<TProgressiveRetryConfig<T>>,
): MonoTypeOperatorFunction<T> {
    return progressiveRetry<T>({
        beforeRetry: (err) => of(createUnsyncedValueDescriptor(convertErrToGrpcFail(err)) as T),
        ...config,
    });
}
