import { assertNever } from '@common/utils/src/assert.ts';
import { isNil } from 'lodash-es';
import type { Observable, OperatorFunction } from 'rxjs';
import { defer, EMPTY, of, timer } from 'rxjs';
import { filter, map, mergeWith, switchMap } from 'rxjs/operators';

export enum EBufferEmitType {
    Buffer = 0,
    PassThrough = 1,
    Flush = 2,
    Skip = 3,
    ResetBuffer = 4,
    ResetBufferPassThrough = 5,
}

const FLUSH_BUFFER_VALUE = Symbol('FLUSH_BUFFER');

type TCondition<T> = (item: T, buffer: T[]) => EBufferEmitType;

export function conditionalBufferTime<T>({
    bufferTimeSpan,
    condition,
    bufferCreationInterval,
    maxBufferSize,
}: {
    bufferTimeSpan: number;
    condition: TCondition<T>;
    bufferCreationInterval?: number;
    maxBufferSize?: number;
}): OperatorFunction<T, T | T[]> {
    return (source: Observable<T>): Observable<T | T[]> =>
        defer(() => {
            const buffer: T[] = [];

            function flush(): Observable<T[]> {
                if (buffer.length === 0) {
                    return EMPTY;
                }

                const buffer$ = of([...buffer]);
                buffer.length = 0;
                return buffer$;
            }

            return source.pipe(
                mergeWith(
                    timer(bufferCreationInterval ?? bufferTimeSpan, bufferTimeSpan).pipe(
                        map((): typeof FLUSH_BUFFER_VALUE => FLUSH_BUFFER_VALUE),
                        filter(() => buffer.length > 0),
                    ),
                ),
                switchMap((item) => {
                    if (item === FLUSH_BUFFER_VALUE) {
                        return flush();
                    }

                    const check = condition(item, buffer);

                    switch (check) {
                        case EBufferEmitType.Flush:
                            buffer.push(item);

                            return flush();

                        case EBufferEmitType.Buffer:
                            buffer.push(item);

                            if (!isNil(maxBufferSize) && maxBufferSize > buffer.length) {
                                return flush();
                            }

                            return EMPTY;

                        case EBufferEmitType.PassThrough:
                            return of(item);

                        case EBufferEmitType.Skip:
                            return EMPTY;

                        case EBufferEmitType.ResetBuffer:
                            buffer.length = 0;
                            return EMPTY;

                        case EBufferEmitType.ResetBufferPassThrough:
                            buffer.length = 0;
                            return of(item);

                        default:
                            assertNever(check);
                    }
                }),
            );
        });
}
