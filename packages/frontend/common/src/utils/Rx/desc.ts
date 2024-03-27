import { isEqual } from 'lodash-es';
import { map, MonoTypeOperatorFunction, Observable, OperatorFunction, switchMap } from 'rxjs';
import { distinctUntilChanged, tap } from 'rxjs/operators';

import type { TFail } from '../../types/Fail';
import type { TStructurallyCloneable } from '../../types/serialization';
import type { ValueDescriptor } from '../../types/ValueDescriptor';
import { EValueDescriptorState } from '../../types/ValueDescriptor';
import { matchDesc, ValueDescriptorHandlers } from '../ValueDescriptor';

/**
 * @deprecated
 */
export function mapDesc<
    V,
    F extends TFail<string, undefined | TStructurallyCloneable>,
    P,
    T1,
    T2,
    T3,
    T4,
>(
    handlers: ValueDescriptorHandlers<T1, T2, T3, T4, V, F, P>,
): OperatorFunction<ValueDescriptor<V, F, P>, T1 | T2 | T3 | T4> {
    return (source: Observable<ValueDescriptor<V, F, P>>) => {
        return source.pipe<T1 | T2 | T3 | T4>(map((d) => matchDesc(d, handlers)));
    };
}

/**
 * @deprecated
 */
export function switchMapDesc<
    V,
    F extends TFail<string, undefined | TStructurallyCloneable>,
    P,
    T1,
    T2,
    T3,
    T4,
>(
    handlers: ValueDescriptorHandlers<
        Observable<T1>,
        Observable<T2>,
        Observable<T3>,
        Observable<T4>,
        V,
        F,
        P
    >,
): OperatorFunction<ValueDescriptor<V, F, P>, T1 | T2 | T3 | T4> {
    return (source: Observable<ValueDescriptor<V, F, P>>) => {
        return source.pipe(switchMap((d): Observable<T1 | T2 | T3 | T4> => matchDesc(d, handlers)));
    };
}

/**
 * @deprecated
 */
export function distinctDescUntilChanged<
    V,
    F extends TFail<string, undefined | TStructurallyCloneable>,
    P,
>(): MonoTypeOperatorFunction<ValueDescriptor<V, F, P>> {
    return distinctUntilChanged((a, b) => {
        if (a.state === EValueDescriptorState.Idle && b.state === EValueDescriptorState.Idle) {
            return true;
        }

        return a.state === b.state && isEqual(a, b);
    });
}

/**
 * @deprecated
 */
export function tapDesc<V, F extends TFail<string, undefined | TStructurallyCloneable>, P>(
    handlers: Partial<{
        idle: () => void;
        unsynchronized: (progress: P, value: V | null, fail: F | null) => void;
        synchronized: (value: V, fail: F | null, progress: P) => void;
        fail: (fail: F, value: V | null, progress: P | null) => void;
    }>,
): MonoTypeOperatorFunction<ValueDescriptor<V, F, P>> {
    return tap((descriptor) =>
        matchDesc(descriptor, {
            idle: () => handlers.idle?.(),
            unsynchronized: (progress, value, fail) =>
                handlers.unsynchronized?.(progress, value, fail),
            synchronized: (value, fail, progress) => handlers.synchronized?.(value, fail, progress),
            fail: (fail, value, progress) => handlers.fail?.(fail, value, progress),
        }),
    );
}
