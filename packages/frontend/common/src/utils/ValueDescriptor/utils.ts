import { isEqual, isFunction, isNil, isObject } from 'lodash-es';

import { Nil } from '../../types';
import { isEqualFails, isFail } from '../../types/Fail';
import {
    EValueDescriptorPendingState,
    EValueDescriptorState2,
    ExtractSyncedValueDescriptor,
    ExtractUnsyncedValueDescriptor,
    ExtractValueDescriptorPayload,
    TGrpcFail,
    TMetaState,
    TSyncedValueDescriptor,
    TUnsyncedValueDescriptor,
    TValueDescriptor2,
} from './types';

export function createSyncedValueDescriptor<P>(value: P): TSyncedValueDescriptor<P> {
    return {
        state: EValueDescriptorState2.Synced,
        value,
        fail: null,
        meta: null,
    };
}

export function createUnsyncedValueDescriptor(
    fail: null | TGrpcFail,
    meta?: null | TMetaState,
): TUnsyncedValueDescriptor;
export function createUnsyncedValueDescriptor<P>(
    value: P,
    fail: null | TGrpcFail,
    meta?: null | TMetaState,
): TUnsyncedValueDescriptor<P>;
export function createUnsyncedValueDescriptor<P = never>(
    valueOrFail: TGrpcFail | P,
    failOrMeta?: null | TGrpcFail | TMetaState,
    meta?: null | TMetaState,
): TUnsyncedValueDescriptor<P> {
    let value;
    let fail;

    if (!isFail(valueOrFail)) {
        value = valueOrFail;
    } else {
        fail = valueOrFail;
    }

    if (isFail(failOrMeta)) {
        fail = failOrMeta;
    } else {
        meta = failOrMeta;
    }

    return {
        state: EValueDescriptorState2.Unsynced,
        value: value ?? null,
        fail: fail ?? null,
        meta: meta ?? null,
    };
}

export function mergeMetaValueDescriptor(
    a: Nil | Partial<TMetaState>,
    b: Nil | Partial<TMetaState>,
): TMetaState {
    return {
        pendingState: a?.pendingState ?? b?.pendingState ?? null,
    };
}

export function upsertMetaValueDescriptor<T extends TValueDescriptor2<any, any>>(
    vd: T,
    meta: Partial<TMetaState>,
): T {
    return {
        state: vd.state,
        fail: vd.fail,
        value: vd.value,
        meta: mergeMetaValueDescriptor(meta, vd.meta),
    } as T;
}

export const EMPTY_VD: TUnsyncedValueDescriptor = {
    state: EValueDescriptorState2.Unsynced,
    value: null,
    fail: null,
    meta: null,
};

export const LOADING_VD: TUnsyncedValueDescriptor = {
    state: EValueDescriptorState2.Unsynced,
    value: null,
    fail: null,
    meta: {
        pendingState: EValueDescriptorPendingState.Loading,
    },
};

export const RECEIVING_VD: TUnsyncedValueDescriptor = {
    state: EValueDescriptorState2.Unsynced,
    value: null,
    fail: null,
    meta: {
        pendingState: EValueDescriptorPendingState.Receiving,
    },
};

export const WAITING_VD: TUnsyncedValueDescriptor = {
    state: EValueDescriptorState2.Unsynced,
    value: null,
    fail: null,
    meta: {
        pendingState: EValueDescriptorPendingState.WaitingArguments,
    },
};

type ExtractSyncPayload<T1, T2> =
    | (T1 extends TSyncedValueDescriptor<infer P1> ? P1 : never)
    | (T2 extends TSyncedValueDescriptor<infer P2> ? P2 : never);

type ExtractUnsyncPayload<T1, T2> =
    | (T1 extends TUnsyncedValueDescriptor<infer P1> ? P1 : never)
    | (T2 extends TUnsyncedValueDescriptor<infer P2> ? P2 : never);

export type TryConvertToValueDescriptor<T1, T2> = T1 extends TValueDescriptor2<any, any>
    ? T2 extends TValueDescriptor2<any, any>
        ? TValueDescriptor2<ExtractSyncPayload<T1, T2>, ExtractUnsyncPayload<T1, T2>>
        : T1 | T2
    : T1 | T2;

export type ValueDescriptorHandlers<
    VD extends TValueDescriptor2<any, any>,
    Out1 = ExtractSyncedValueDescriptor<VD>,
    Out2 = ExtractUnsyncedValueDescriptor<VD>,
> = {
    synced: (desc: ExtractSyncedValueDescriptor<VD>) => Out1;
    unsynced: (desc: ExtractUnsyncedValueDescriptor<VD>) => Out2;
};

export type ValueDescriptorHandler<
    VD extends TValueDescriptor2<any, any>,
    Out1 = ExtractSyncedValueDescriptor<VD>,
> = (desc: ExtractSyncedValueDescriptor<VD>) => Out1;

export function matchValueDescriptor<VD extends TValueDescriptor2<any, any>, Out1, Out2>(
    descriptor: VD,
    handlers: ValueDescriptorHandler<VD, Out1> | ValueDescriptorHandlers<VD, Out1, Out2>,
): TryConvertToValueDescriptor<Out1, Out2> {
    const synced = isFunction(handlers) ? handlers : handlers.synced;
    const unsynced = isFunction(handlers)
        ? (vd: ExtractUnsyncedValueDescriptor<VD>): Out2 => vd as Out2
        : handlers.unsynced;

    switch (descriptor.state) {
        case EValueDescriptorState2.Synced:
            return synced(
                descriptor as ExtractSyncedValueDescriptor<VD>,
            ) as TryConvertToValueDescriptor<Out1, Out2>;
        case EValueDescriptorState2.Unsynced:
            return unsynced(
                descriptor as ExtractUnsyncedValueDescriptor<VD>,
            ) as TryConvertToValueDescriptor<Out1, Out2>;
    }
}

export function isValueDescriptor<T extends unknown | TValueDescriptor2<any, any>>(
    value: T,
): value is Extract<T, TValueDescriptor2<any, any>> {
    return isObject(value) && 'state' in value && 'fail' in value && 'value' in value;
}

export function isSyncedValueDescriptor<VD extends TValueDescriptor2<any, any>>(
    value: VD,
): value is ExtractSyncedValueDescriptor<VD> {
    return value.state === EValueDescriptorState2.Synced;
}

export function isUnsyncedValueDescriptor<VD extends TValueDescriptor2<any, any>>(
    value: VD,
): value is ExtractUnsyncedValueDescriptor<VD> {
    return value.state === EValueDescriptorState2.Unsynced;
}

export function isEqualValueDescriptor<
    A extends TValueDescriptor2<any, any>,
    B extends TValueDescriptor2<any, any>,
>(
    a: A,
    b: B,
    isEqualPayload: (
        a: ExtractValueDescriptorPayload<A>,
        b: ExtractValueDescriptorPayload<B>,
    ) => boolean = isEqual,
) {
    if (a.state !== b.state) return false;
    if (isNil(a.fail) !== isNil(b.fail)) return false;
    if (isNil(a.value) !== isNil(b.value)) return false;
    if (!isNil(a.fail) && !isNil(b.fail) && !isEqualFails(a.fail, b.fail)) return false;
    if (!isNil(a.value) && !isNil(b.value) && !isEqualPayload(a.value, b.value)) return false;

    return true;
}

export function isEmptyValueDescriptor(vd: TValueDescriptor2<any, any>): boolean {
    return isUnsyncedValueDescriptor(vd) && isNil(vd.fail) && isNil(vd.meta);
}

export function isLoadingValueDescriptor(vd: TValueDescriptor2<any, any>): boolean {
    return vd.meta?.pendingState === EValueDescriptorPendingState.Loading;
}

export function isWaitingArgumentsValueDescriptor(vd: TValueDescriptor2<any, any>): boolean {
    return vd.meta?.pendingState === EValueDescriptorPendingState.WaitingArguments;
}

export function isReceivingValueDescriptor(vd: TValueDescriptor2<any, any>): boolean {
    return vd.meta?.pendingState === EValueDescriptorPendingState.Receiving;
}

export function isFailValueDescriptor<T extends TValueDescriptor2<any, any>>(
    vd: T,
): vd is T & { fail: TGrpcFail } {
    return isUnsyncedValueDescriptor(vd) && !isNil(vd.fail);
}
