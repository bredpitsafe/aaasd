import { Observable, ObservableNotification, OperatorFunction } from 'rxjs';

import { TStructurallyCloneable } from '../../../types/serialization';
import { trySerializeError } from './utils';

export function materialize<T extends TStructurallyCloneable>(): OperatorFunction<
    T,
    ObservableNotification<T>
> {
    return function (source: Observable<T>): Observable<ObservableNotification<T>> {
        return new Observable((subscriber) => {
            const sub = source.subscribe({
                next(value) {
                    subscriber.next({ kind: 'N', value });
                },
                error(error) {
                    subscriber.next({ kind: 'E', error: trySerializeError(error) });
                    subscriber.complete();
                },
                complete() {
                    subscriber.next({ kind: 'C' });
                    subscriber.complete();
                },
            });

            return () => sub.unsubscribe();
        });
    };
}
