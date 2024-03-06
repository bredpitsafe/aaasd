import { Opaque } from '../types';

export type TModuleConstructor<T> = (ref: TContextRef) => T;
export type TContextRef = Opaque<{}, 'ContextRef'>;
export type TContextContainer = WeakMap<Function, unknown>;

const mapIdToContainer = new WeakMap<TContextRef, TContextContainer>();

export function toContextRef<T extends object>(v: T): TContextRef {
    return v as unknown as TContextRef;
}

export enum EContextTag {
    UI = 'UI',
}

const mapIdToTag = new WeakMap<TContextRef, Set<EContextTag>>();

export function attachTag(v: TContextRef, tag: EContextTag): void {
    mapIdToTag.set(v, (mapIdToTag.get(v) ?? new Set<EContextTag>()).add(tag));
}

export function hasTag(v: TContextRef, tag: EContextTag): boolean {
    return Boolean(mapIdToTag.get(v)?.has(tag));
}

export function ModuleFactory<R>(constructor: (ref: TContextRef) => R): TModuleConstructor<R> {
    return function moduleConstructor(ref: TContextRef): R {
        if (!mapIdToContainer.has(ref)) {
            mapIdToContainer.set(ref, new WeakMap());
        }

        if (!mapIdToContainer.get(ref)!.has(constructor)) {
            mapIdToContainer.get(ref)!.set(constructor, constructor(ref));
        }

        return mapIdToContainer.get(ref)!.get(constructor) as R;
    };
}
