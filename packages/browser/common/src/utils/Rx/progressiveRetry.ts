import { isUndefined } from 'lodash-es';
import {
    combineLatest,
    MonoTypeOperatorFunction,
    NEVER,
    Observable,
    of,
    pipe,
    retryWhen,
    switchMap,
    tap,
    throwError,
    timer,
} from 'rxjs';

import { documentVisibilityState$ } from '../observable/documentVisibilityState';

type TProgressiveRetryConfig = {
    initialInterval: number;
    maxRetries: number | undefined;
    maxInterval: number;
    shouldRetry: (error: any, attempt: number, visible: boolean) => Observable<boolean>;
    backoffDelay: (iteration: number, initialInterval: number) => number;
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
} satisfies Record<string, TProgressiveRetryConfig['backoffDelay']>;

const DEFAULT_PROGRESSIVE_RETRY_CONFIG: TProgressiveRetryConfig = {
    initialInterval: 3_000,
    maxRetries: undefined,
    backoffDelay: RETRY_STRATEGY.LINEAR,
    maxInterval: 60_000,
    shouldRetry: () => of(true),
};

export function progressiveRetry<T>(
    config: Partial<TProgressiveRetryConfig> = {},
): MonoTypeOperatorFunction<T> {
    return pipe(
        retryWhen(backoffRetryStrategy({ ...config, ...DEFAULT_PROGRESSIVE_RETRY_CONFIG })),
    );
}

export const backoffRetryStrategy = (config: TProgressiveRetryConfig) => {
    const { maxRetries, maxInterval, initialInterval, shouldRetry, backoffDelay } = config;
    return (error$: Observable<any>) => {
        let index = 0;
        return combineLatest([
            /* Reset index when visibility changes */
            documentVisibilityState$.pipe(
                tap(() => {
                    index = 0;
                }),
            ),
            error$,
        ]).pipe(
            switchMap(([visible, error]) => {
                const attempt = index++;
                // If page is not currently visible, attempt no retries and just stall the observable
                if (!visible) {
                    return NEVER;
                }

                // If `maxRetries` is set & we're out of attempts, throw original error
                if (!isUndefined(maxRetries) && attempt > maxRetries) {
                    return throwError(error);
                }

                // Calculate next delay depending on current attempt number
                const delayStrategy = backoffDelay ?? RETRY_STRATEGY.LINEAR;
                const currentInterval = delayStrategy(attempt, initialInterval);

                const delay = isUndefined(maxInterval)
                    ? currentInterval
                    : Math.min(currentInterval, maxInterval);

                return shouldRetry(error, attempt, visible).pipe(
                    switchMap((result) => (result ? timer(delay) : throwError(error))),
                );
            }),
        );
    };
};
