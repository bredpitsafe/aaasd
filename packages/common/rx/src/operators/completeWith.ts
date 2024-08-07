import type { MonoTypeOperatorFunction, Observable, Subscriber } from 'rxjs';
import { OperatorSubscriber } from 'rxjs/internal/operators/OperatorSubscriber';
import { operate } from 'rxjs/internal/util/lift';

export function completeWith<T>(v: T | (() => T)): MonoTypeOperatorFunction<T> {
    return operate((source: Observable<T>, subscriber: Subscriber<T>) => {
        source.subscribe(
            new OperatorSubscriber(subscriber, undefined, () => {
                subscriber.next(typeof v === 'function' ? (v as () => T)() : v);
            }),
        );
    });
}
