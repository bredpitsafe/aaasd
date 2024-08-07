import { assertNever } from '@common/utils/src/assert.ts';
import type { MonoTypeOperatorFunction, Observable } from 'rxjs';
import { defer, EMPTY, from, of } from 'rxjs';
import { concatMap } from 'rxjs/operators';

export enum EDelayEmitType {
    Delay,
    PassThrough,
    Pass,
}

export function delayEmit<T>(condition: (value: T) => EDelayEmitType): MonoTypeOperatorFunction<T> {
    return (source: Observable<T>): Observable<T> =>
        defer(() => {
            const buffer: T[] = [];
            let opened = false;

            return source.pipe(
                concatMap((value): Observable<T> => {
                    if (opened) {
                        return of(value);
                    }

                    const emitType = condition(value);

                    switch (emitType) {
                        case EDelayEmitType.Delay:
                            buffer.push(value);
                            return EMPTY;
                        case EDelayEmitType.PassThrough:
                            return of(value);
                        case EDelayEmitType.Pass:
                            opened = true;
                            const newBuffer = [value, ...buffer];
                            buffer.length = 0;
                            return from(newBuffer);
                        default:
                            assertNever(emitType);
                    }
                }),
            );
        });
}
