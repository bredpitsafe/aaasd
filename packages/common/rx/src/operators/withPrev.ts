import type { OperatorFunction } from 'rxjs';
import { OperatorSubscriber } from 'rxjs/internal/operators/OperatorSubscriber';
import { operate } from 'rxjs/internal/util/lift';

export function withPrev<T>(): OperatorFunction<T, [undefined | T, T]> {
    return operate((source, subscriber) => {
        let prev: T;
        source.subscribe(
            new OperatorSubscriber(subscriber, (value) => {
                const p = prev;
                prev = value;
                subscriber.next([p, value]);
            }),
        );
    });
}
