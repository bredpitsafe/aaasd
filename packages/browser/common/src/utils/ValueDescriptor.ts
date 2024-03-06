import type { TFail } from '../types/Fail';
import type { TStructurallyCloneable } from '../types/serialization';
import { EValueDescriptorState, ValueDescriptor } from '../types/ValueDescriptor';

/**
 * @deprecated
 */
export function createIdleDescriptor<
    T,
    F extends TFail<string, undefined | TStructurallyCloneable>,
    P = null,
>(): ValueDescriptor<T, F, P> {
    return {
        state: EValueDescriptorState.Idle,
        value: null,
        fail: null,
        progress: null,
    };
}

/**
 * @deprecated
 */
export const IdleDesc = createIdleDescriptor;

/**
 * @deprecated
 */
export function createUnsynchronizedDescriptor<
    T,
    F extends TFail<string, undefined | TStructurallyCloneable>,
    P = null,
>(progress: P, value?: T | null, fail?: F | null): ValueDescriptor<T, F, P> {
    return {
        state: EValueDescriptorState.Unsynchronized,
        value: value ?? null,
        fail: fail ?? null,
        progress,
    };
}

/**
 * @deprecated
 */
export const UnscDesc = createUnsynchronizedDescriptor;

/**
 * @deprecated
 */
export function createSynchronizedDescriptor<
    T,
    F extends TFail<string, undefined | TStructurallyCloneable>,
    P = null,
>(value: T, progress: P, fail?: F | null): ValueDescriptor<T, F, P> {
    return {
        state: EValueDescriptorState.Synchronized,
        value,
        fail: fail ?? null,
        progress,
    };
}

/**
 * @deprecated
 */
export const SyncDesc = createSynchronizedDescriptor;

/**
 * @deprecated
 */
export function createFailDescriptor<
    T,
    F extends TFail<string, undefined | TStructurallyCloneable>,
    P = null,
>(fail: F, value?: T | null, progress?: P | null): ValueDescriptor<T, F, P> {
    return {
        state: EValueDescriptorState.Fail,
        value: value ?? null,
        fail,
        progress: progress ?? null,
    };
}

/**
 * @deprecated
 */
export const FailDesc = createFailDescriptor;

/**
 * @deprecated
 */
export type ValueDescriptorHandlers<
    T1,
    T2,
    T3,
    T4,
    TIn,
    FIn extends TFail<string, undefined | TStructurallyCloneable>,
    PIn = null,
> = {
    idle: () => T1;
    unsynchronized: (progress: PIn, value: TIn | null, fail: FIn | null) => T2;
    synchronized: (value: TIn, fail: FIn | null, progress: PIn) => T3;
    fail: (fail: FIn, value: TIn | null, progress: PIn | null) => T4;
};

/**
 * @deprecated
 */
export function matchValueDescriptor<
    T1,
    T2,
    T3,
    T4,
    TIn,
    FIn extends TFail<string, undefined | TStructurallyCloneable>,
    PIn = null,
>(
    descriptor: ValueDescriptor<TIn, FIn, PIn>,
    handlers: ValueDescriptorHandlers<T1, T2, T3, T4, TIn, FIn, PIn>,
): T1 | T2 | T3 | T4 {
    switch (descriptor.state) {
        case EValueDescriptorState.Idle:
            return handlers.idle();
        case EValueDescriptorState.Unsynchronized:
            return handlers.unsynchronized(descriptor.progress, descriptor.value, descriptor.fail);
        case EValueDescriptorState.Synchronized:
            return handlers.synchronized(descriptor.value, descriptor.fail, descriptor.progress);
        case EValueDescriptorState.Fail:
            return handlers.fail(descriptor.fail, descriptor.value, descriptor.progress);
    }
}

/**
 * @deprecated
 */
export const matchDesc = matchValueDescriptor;

/**
 * @deprecated
 */
export function isIdleDesc<T, F extends TFail<string, undefined | TStructurallyCloneable>, P>(
    d: ValueDescriptor<T, F, P>,
): d is {
    state: EValueDescriptorState.Idle;
    value: null;
    fail: null;
    progress: null;
} {
    return d.state === EValueDescriptorState.Idle;
}

/**
 * @deprecated
 */
export function isSyncDesc<T, F extends TFail<string, undefined | TStructurallyCloneable>, P>(
    d: ValueDescriptor<T, F, P>,
): d is {
    state: EValueDescriptorState.Synchronized;
    value: T;
    fail: F | null;
    progress: P;
} {
    return d.state === EValueDescriptorState.Synchronized;
}

/**
 * @deprecated
 */
export function isUnscDesc<T, F extends TFail<string, undefined | TStructurallyCloneable>, P>(
    d: ValueDescriptor<T, F, P>,
): d is {
    state: EValueDescriptorState.Unsynchronized;
    value: T | null;
    fail: F | null;
    progress: P;
} {
    return d.state === EValueDescriptorState.Unsynchronized;
}

/**
 * @deprecated
 */
export function isFailDesc<T, F extends TFail<string, undefined | TStructurallyCloneable>, P>(
    d: ValueDescriptor<T, F, P>,
): d is {
    state: EValueDescriptorState.Fail;
    value: T | null;
    fail: F;
    progress: P;
} {
    return d.state === EValueDescriptorState.Fail;
}

/**
 * @deprecated
 */
export function ValueDescriptorFactory<
    T,
    F extends TFail<string, undefined | TStructurallyCloneable>,
    P = null,
>(): {
    idle: () => ValueDescriptor<T, F, P>;
    unsc: (progress: P, value?: T | null, fail?: F | null) => ValueDescriptor<T, F, P>;
    sync: (value: T, progress: P, fail?: F | null) => ValueDescriptor<T, F, P>;
    fail: (fail: F, value?: T | null, progress?: P | null) => ValueDescriptor<T, F, P>;
} {
    return {
        idle: createIdleDescriptor,
        unsc: createUnsynchronizedDescriptor,
        sync: createSynchronizedDescriptor,
        fail: createFailDescriptor,
    };
}

/**
 * @deprecated
 */
export type ExtractValueDescriptor<
    T extends {
        idle: (
            progress: any,
            value?: any | null,
            fail?: any | null,
        ) => ValueDescriptor<any, any, any>;
    },
> = ReturnType<T['idle']>;
