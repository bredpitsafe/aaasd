import {
    CompleteNotification,
    ErrorNotification,
    NextNotification,
    Observable,
    OperatorFunction,
} from 'rxjs';

import { IStructurallyCloneableErrorClass } from '../../../types/serialization';
import { tryDeserializeError } from './utils';

export function dematerialize<T>(
    ErrorClasses: IStructurallyCloneableErrorClass[],
): OperatorFunction<NextNotification<T> | ErrorNotification | CompleteNotification, T> {
    return function (
        source: Observable<NextNotification<T> | ErrorNotification | CompleteNotification>,
    ): Observable<T> {
        return new Observable((subscriber) => {
            const sub = source.subscribe({
                next(value) {
                    const { kind } = value;

                    switch (kind) {
                        case 'N':
                            subscriber.next?.(value.value!);
                            return;
                        case 'E':
                            subscriber.error?.(tryDeserializeError(value.error, ErrorClasses));
                            return;
                        default:
                            subscriber.complete?.();
                            return;
                    }
                },
                error(error) {
                    subscriber.error(error);
                    subscriber.complete();
                },
                complete() {
                    subscriber.complete();
                },
            });

            return () => sub.unsubscribe();
        });
    };
}
