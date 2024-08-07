import { isEqual, isObject } from 'lodash-es';

import { has } from '../utils/has';
import type { TStructurallyCloneable } from './serialization';

const FAIL_TAG = 'FAIL' as const;

export type TScopedFail<
    S extends Exclude<string, ''>,
    C extends Exclude<string, ''>,
    M extends undefined | TStructurallyCloneable = never,
> = TFail<`[${S}]: ${C}`, M>;

export type TFail<T extends string, M extends undefined | TStructurallyCloneable = undefined> = {
    tag: typeof FAIL_TAG;
    code: T;
    meta: M;
};

export type TFailConstructor<P extends string = ''> = {
    <C extends string>(code: C): TFail<P extends '' ? C : `[${P}]: ${C}`>;
    <C extends string, M extends TStructurallyCloneable>(
        code: C,
        meta: M,
    ): TFail<P extends '' ? C : `[${P}]: ${C}`, M>;
};

export const Fail: TFailConstructor = (code: any, meta?: any) => {
    return {
        tag: FAIL_TAG,
        code,
        meta,
    };
};

const prefixSet = new Set<string>();
export function FailFactory<P extends string>(prefix: P): TFailConstructor<P> {
    if (prefixSet.has(prefix)) {
        throw new Error(`Prefix ${prefix} already used`);
    }

    prefixSet.add(prefix);

    return ((code: any, meta: any) => Fail(`[${prefix}]: ${code}`, meta)) as TFailConstructor<P>;
}

export function isFail<F extends TFail<any, any>>(v: unknown): v is F {
    return isObject(v) && has(v, 'tag') && v['tag'] === FAIL_TAG;
}

export function isEqualFails<A extends TFail<any, any>, B extends TFail<any, any>>(a: A, b: B) {
    return a.tag === b.tag && a.code === b.code && isEqual(a.meta, b.meta);
}
