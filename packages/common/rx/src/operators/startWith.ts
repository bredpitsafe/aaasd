import type { Observable, OperatorFunction } from 'rxjs';
import { defer } from 'rxjs';
import { startWith, tap } from 'rxjs/operators';

export function startWithLastValue<T>(seed: T): OperatorFunction<T, T> {
    return (source: Observable<T>) => {
        let lastValue: undefined | T;

        return defer(() => {
            return source.pipe(
                tap((value) => (lastValue = value)),
                startWith(lastValue ?? seed),
            );
        });
    };
}
