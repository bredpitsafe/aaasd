import { shareReplayWithDelayedReset } from '@common/rx';
import type { Milliseconds } from '@common/types';
import type { Subscription } from 'rxjs';
import { firstValueFrom, merge, Observable, toArray } from 'rxjs';
import { map } from 'rxjs/operators';

import { Defer } from '../Defer';
import { dedobs } from './memo';

describe('dedobs', () => {
    const subscriptions: Subscription[] = [];
    let instance = 0;

    beforeEach(() => {
        instance = 0;
    });

    afterEach(() => {
        subscriptions.forEach((subscription) => subscription.unsubscribe());
        subscriptions.length = 0;
    });

    it('should memoize data', async () => {
        const resultItems = 4;

        const generatorFn$ = () =>
            new Observable((subscriber) => {
                instance++;

                subscriber.next(`${instance}: A`);
                subscriber.next(`${instance}: B`);
                subscriber.next(`${instance}: C`);
            }).pipe(shareReplayWithDelayedReset(1000 as Milliseconds));

        const memoizedGenerator$ = dedobs(generatorFn$, {
            removeDelay: 1000,
        });

        const result: any[] = [];
        const testAwaiter = new Defer<void>();

        subscriptions.push(
            memoizedGenerator$().subscribe({
                next(value) {
                    result.push(value);

                    if (result.length === resultItems) {
                        testAwaiter.resolve();
                    }
                },
            }),
        );

        subscriptions.push(
            memoizedGenerator$().subscribe({
                next(value) {
                    result.push(value);

                    if (result.length === resultItems) {
                        testAwaiter.resolve();
                    }
                },
            }),
        );

        await testAwaiter.promise;

        expect(result).toEqual(['1: A', '1: B', '1: C', '1: C']);
    });

    it('should memoize for parameter data', async () => {
        const resultItems = 6;

        const generatorFn$ = (reqId: number) =>
            new Observable((subscriber) => {
                instance++;

                subscriber.next(`[${reqId}] ${instance}: A`);
                subscriber.next(`[${reqId}] ${instance}: B`);
                subscriber.next(`[${reqId}] ${instance}: C`);
            }).pipe(shareReplayWithDelayedReset(1000 as Milliseconds));

        const memoizedGenerator$ = dedobs(generatorFn$, {
            removeDelay: 1000,
        });

        const result: any[] = [];
        const testAwaiter = new Defer<void>();

        subscriptions.push(
            memoizedGenerator$(101).subscribe({
                next(value) {
                    result.push(value);
                },
            }),
        );

        subscriptions.push(
            memoizedGenerator$(102).subscribe({
                next(value) {
                    result.push(value);

                    if (result.length === resultItems) {
                        testAwaiter.resolve();
                    }
                },
            }),
        );

        await testAwaiter.promise;

        expect(result).toEqual([
            '[101] 1: A',
            '[101] 1: B',
            '[101] 1: C',
            '[102] 2: A',
            '[102] 2: B',
            '[102] 2: C',
        ]);
    });

    it('nested dedobs case', async () => {
        const generatorFn$ = dedobs(
            (deep: number): Observable<number> =>
                new Observable((subscriber) => {
                    if (deep === 0) {
                        setTimeout(() => {
                            subscriber.next(Math.random());
                            subscriber.complete();
                        }, 100);
                    }
                    return generatorFn$(deep - 1)
                        .pipe(map((v) => v + deep))
                        .subscribe(subscriber);
                }),
            {
                resetDelay: 1000,
                removeDelay: 1000,
            },
        );

        const generator$ = generatorFn$(3);
        const result = await firstValueFrom(merge(generator$, generator$).pipe(toArray()));

        expect(result.length).toEqual(2);
        expect(result[0]).toEqual(result[1]);
    });

    it('should reset after error', async () => {
        const generatorFn$ = () =>
            new Observable((subscriber) => {
                instance++;

                subscriber.next(`${instance}: A`);
                subscriber.next(`${instance}: B`);
                subscriber.next(`${instance}: C`);

                subscriber.error('AUTH ERROR');
            }).pipe(shareReplayWithDelayedReset(1000 as Milliseconds));

        const memoizedGenerator$ = dedobs(generatorFn$, {
            removeDelay: 1000,
        });

        const result: any[] = [];
        const testAwaiter = new Defer<void>();

        subscriptions.push(
            memoizedGenerator$().subscribe({
                next(value) {
                    result.push(value);
                },
                error(error) {
                    result.push(error);
                },
            }),
        );

        subscriptions.push(
            memoizedGenerator$().subscribe({
                next(value) {
                    result.push(value);
                },
                error(error) {
                    result.push(error);
                    testAwaiter.resolve();
                },
            }),
        );

        await testAwaiter.promise;

        expect(result).toEqual([
            '1: A',
            '1: B',
            '1: C',
            'AUTH ERROR',
            '2: A',
            '2: B',
            '2: C',
            'AUTH ERROR',
        ]);
    });

    it('should reset cache after remove delay', async () => {
        const resultItems = 6;

        const generatorFn$ = () =>
            new Observable((subscriber) => {
                instance++;

                subscriber.next(`${instance}: A`);
                subscriber.next(`${instance}: B`);
                subscriber.next(`${instance}: C`);
            }).pipe(shareReplayWithDelayedReset(10 as Milliseconds));

        const memoizedGenerator$ = dedobs(generatorFn$, {
            removeDelay: 10,
        });

        const result: any[] = [];
        const testAwaiter = new Defer<void>();

        const subscription = memoizedGenerator$().subscribe({
            next(value) {
                result.push(value);
            },
            error(error) {
                result.push(error);
            },
        });

        subscription.unsubscribe();

        setTimeout(() => {
            subscriptions.push(
                memoizedGenerator$().subscribe({
                    next(value) {
                        result.push(value);

                        if (result.length === resultItems) {
                            testAwaiter.resolve();
                        }
                    },
                }),
            );
        }, 50);

        await testAwaiter.promise;

        expect(result).toEqual(['1: A', '1: B', '1: C', '2: A', '2: B', '2: C']);
    });

    it('should not reset cache before remove delay', async () => {
        const resultItems = 4;

        const generatorFn$ = () =>
            new Observable((subscriber) => {
                instance++;

                subscriber.next(`${instance}: A`);
                subscriber.next(`${instance}: B`);
                subscriber.next(`${instance}: C`);
            }).pipe(shareReplayWithDelayedReset(100 as Milliseconds));

        const memoizedGenerator$ = dedobs(generatorFn$, {
            removeDelay: 100,
        });

        const result: any[] = [];
        const testAwaiter = new Defer<void>();

        const subscription = memoizedGenerator$().subscribe({
            next(value) {
                result.push(value);
            },
            error(error) {
                result.push(error);
            },
        });

        subscription.unsubscribe();

        setTimeout(() => {
            subscriptions.push(
                memoizedGenerator$().subscribe({
                    next(value) {
                        result.push(value);

                        if (result.length === resultItems) {
                            testAwaiter.resolve();
                        }
                    },
                }),
            );
        }, 50);

        await testAwaiter.promise;

        expect(result).toEqual(['1: A', '1: B', '1: C', '1: C']);
    });
});
