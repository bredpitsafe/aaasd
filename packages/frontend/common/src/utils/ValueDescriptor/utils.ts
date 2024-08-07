import type { Nil } from '@common/types';
import { isEqual, isFunction, isNil, isObject } from 'lodash-es';
import { pipe } from 'rxjs';

import { isEqualFails, isFail } from '../../types/Fail';
import { mapValueDescriptor, scanValueDescriptor } from '../Rx/ValueDescriptor2';
import type { UnifierWithCompositeHash } from '../unifierWithCompositeHash';
import type {
    ExtractSyncedValueDescriptor,
    ExtractSyncedValueDescriptorPayload,
    ExtractUnsyncedValueDescriptor,
    ExtractValueDescriptorPayload,
    TGrpcFail,
    TMetaState,
    TSyncedValueDescriptor,
    TUnsyncedValueDescriptor,
    TValueDescriptor2,
} from './types';
import { EValueDescriptorPendingState, EValueDescriptorState2 } from './types';

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

export const WAITING_VD: TUnsyncedValueDescriptor = {
    state: EValueDescriptorState2.Unsynced,
    value: null,
    fail: null,
    meta: {
        pendingState: EValueDescriptorPendingState.WaitingArguments,
    },
};

export const REQUESTING_VD: TUnsyncedValueDescriptor = {
    state: EValueDescriptorState2.Unsynced,
    value: null,
    fail: null,
    meta: {
        pendingState: EValueDescriptorPendingState.Requesting,
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

export function isValueDescriptor<T extends TValueDescriptor2<any, any>>(
    value: unknown | T,
): value is Extract<T, TValueDescriptor2<any, any>> {
    return isObject(value) && 'state' in value && 'fail' in value && 'value' in value;
}

export function isSyncedValueDescriptor<VD extends TValueDescriptor2<any, any>>(
    value: Nil | VD,
): value is ExtractSyncedValueDescriptor<VD> {
    return !isNil(value) && value.state === EValueDescriptorState2.Synced;
}

export function isUnsyncedValueDescriptor<VD extends TValueDescriptor2<any, any>>(
    value: Nil | VD,
): value is ExtractUnsyncedValueDescriptor<VD> {
    return !isNil(value) && value.state === EValueDescriptorState2.Unsynced;
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

export function isEmptyValueDescriptor(vd: Nil | TValueDescriptor2<any, any>): boolean {
    return isUnsyncedValueDescriptor(vd) && isNil(vd.fail) && isNil(vd.meta);
}

export function isWaitingArgumentsValueDescriptor(vd: Nil | TValueDescriptor2<any, any>): boolean {
    return vd?.meta?.pendingState === EValueDescriptorPendingState.WaitingArguments;
}

export function isRequestingValueDescriptor(vd: Nil | TValueDescriptor2<any, any>): boolean {
    return vd?.meta?.pendingState === EValueDescriptorPendingState.Requesting;
}

export function isReceivingValueDescriptor(vd: Nil | TValueDescriptor2<any, any>): boolean {
    return vd?.meta?.pendingState === EValueDescriptorPendingState.Receiving;
}

export function isLoadingValueDescriptor(vd: Nil | TValueDescriptor2<any, any>): boolean {
    return (
        isWaitingArgumentsValueDescriptor(vd) ||
        isRequestingValueDescriptor(vd) ||
        isReceivingValueDescriptor(vd)
    );
}

export function isFailValueDescriptor<T extends TValueDescriptor2<any, any>>(
    vd: Nil | T,
): vd is T & { fail: TGrpcFail } {
    return isUnsyncedValueDescriptor(vd) && !isNil(vd.fail);
}

type TServerSubscriptionStruct<Item extends object, RemoveItem extends object> =
    | {
          type: 'ok';
          ok: { platformTime?: string | undefined };
      }
    | {
          type: 'snapshot';
          snapshot: { entities: Item[] };
      }
    | {
          type: 'updates';
          updates: {
              upserted: Item[];
              // In perfect world we should use subset of T with necessary fields for creating key
              removed: RemoveItem[];
          };
      };

export function convertToSnapshotValueDescriptor<
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    VD extends TValueDescriptor2<any>,
    Item extends RemoveItem,
    RemoveItem extends object,
>(
    constructor: () => UnifierWithCompositeHash<Item>,
    getPayload?: (
        vd: TSyncedValueDescriptor<ExtractSyncedValueDescriptorPayload<VD>>,
    ) => TServerSubscriptionStruct<Item, RemoveItem>,
) {
    return pipe(
        scanValueDescriptor<VD, TValueDescriptor2<UnifierWithCompositeHash<Item>>>((acc, vd) => {
            const cache = acc?.value ?? constructor();
            const payload = getPayload?.(vd) ?? vd.value;

            if (vd.value.type === 'ok') {
                cache.clear();
            }

            if (vd.value.type === 'snapshot') {
                cache.clear();
                cache.upsert(payload.snapshot.entities);
            }

            if (vd.value.type === 'updates') {
                cache.remove(vd.value.updates.removed).upsert(vd.value.updates.upserted);
            }

            return createSyncedValueDescriptor(cache);
        }),
        mapValueDescriptor(({ value }) => createSyncedValueDescriptor(value.toArray())),
    );
}
