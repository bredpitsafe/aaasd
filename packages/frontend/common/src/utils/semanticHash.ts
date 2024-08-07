import type { Nil, TPrimitive, TStructurallyCloneable } from '@common/types';
import hash_sum from 'hash-sum';
import { isArray, isDate, isEmpty, isFunction, isNil, isObject, isRegExp } from 'lodash-es';

type TWithSorter<T> = {
    '.toSorted': null | ((a: T, b: T) => number);
};

type TWithHasher<T> = {
    '.toHash': (v: T) => TPrimitive;
};

type TWithCloneable<T> = {
    '.toStructurallyCloneable': (v: T) => TStructurallyCloneable;
};

type TWithNullable<T> = {
    '.isNullable': null | ((v: T) => boolean);
};

type ExtendWithSorter<T> = T extends Array<unknown> ? TWithSorter<T[number]> : never;
type ExtendWithCloneable<T> = T extends TStructurallyCloneable
    ? never
    : TWithCloneable<T> | TWithHasher<T>;
type ExtendWithDescriptor<T> = T extends Array<unknown>
    ? T[number] extends TPrimitive
        ? never
        : THashDescriptor<T[number]>
    : THashDescriptor<T>;
type ExtendWithNullable<T> = T extends {} ? TWithNullable<T> : never;

export type THashDescriptor<T> = {
    [K in keyof Required<T> as Required<T>[K] extends TPrimitive ? never : K]:
        | ExtendWithDescriptor<T[K]>
        | ExtendWithSorter<T[K]>
        | ExtendWithCloneable<T[K]>
        | ExtendWithNullable<T[K]>;
};

function getHash<T extends object | undefined, D extends THashDescriptor<T>>(
    struct: T,
    descriptor: D,
): string {
    return hash_sum(isNil(struct) ? struct : deepMap(struct, descriptor));
}

const withCloner = <T>(cloner: (v: T) => TStructurallyCloneable): TWithCloneable<T> => {
    return {
        '.toStructurallyCloneable': cloner,
    };
};

const withHasher = <T>(hash: (v: T) => TPrimitive): TWithHasher<T> => {
    return {
        '.toHash': hash,
    };
};

const withSorter = <T>(predicate: null | ((a: T, b: T) => number)): TWithSorter<T> => {
    return {
        '.toSorted': predicate,
    };
};

const withNullable = <T>(predicate?: (v: T) => boolean): TWithNullable<T> => {
    return {
        '.isNullable': predicate ?? null,
    };
};

export const semanticHash = {
    get: getHash,
    withCloner,
    withHasher,
    withSorter,
    withNullable,
};

function hasSorter<T>(desc: unknown): desc is TWithSorter<T> {
    return isObject(desc) && '.toSorted' in desc;
}

function hasCloner<T>(desc: unknown): desc is TWithCloneable<T> {
    return isObject(desc) && '.toStructurallyCloneable' in desc;
}

function hasHasher<T>(desc: unknown): desc is TWithHasher<T> {
    return isObject(desc) && '.toHash' in desc;
}

function hasIsNullable<T>(desc: unknown): desc is TWithNullable<T> {
    return isObject(desc) && '.isNullable' in desc;
}

function deepMap(
    value: object | unknown[] | TPrimitive,
    descriptor:
        | Nil
        | THashDescriptor<any>
        | TWithSorter<any>
        | TWithNullable<any>
        | (TWithSorter<any> & THashDescriptor<any>),
): object | unknown[] | TPrimitive {
    const isNullable =
        !isNil(descriptor) && hasIsNullable(descriptor)
            ? descriptor['.isNullable'] ?? isNil
            : undefined;

    if (!isNil(isNullable) && isNullable(value)) {
        return undefined;
    }

    if (isArray(value)) {
        if (!isNil(descriptor) && hasSorter(descriptor)) {
            if (descriptor['.toSorted'] !== null) {
                value = value.slice().sort(descriptor['.toSorted']);
            }
        } else {
            throw new Error('Cannot sort array without .toSorted predicate');
        }

        return (value as any[]).map((item) => deepMap(item, descriptor));
    } else if (isObject(value) && !isDate(value) && !isRegExp(value) && !isFunction(value)) {
        return Object.keys(value as object)
            .sort()
            .reduce((acc, key) => {
                const rawSubValue = value?.[key as keyof typeof value];
                const subValue =
                    (isArray(rawSubValue) || isObject(rawSubValue)) && isEmpty(rawSubValue)
                        ? undefined
                        : rawSubValue;
                const subDesc = descriptor?.[key as keyof typeof value] as
                    | Nil
                    | THashDescriptor<any>
                    | TWithSorter<any>
                    | TWithNullable<any>
                    | (TWithSorter<any> & THashDescriptor<any>);

                const transformer = isNil(subDesc)
                    ? undefined
                    : hasHasher(subDesc)
                      ? subDesc['.toHash']
                      : hasCloner(subDesc)
                        ? subDesc['.toStructurallyCloneable']
                        : undefined;

                const isNullable =
                    !isNil(subDesc) && hasIsNullable(subDesc)
                        ? subDesc['.isNullable'] ?? isNil
                        : undefined;

                if (!isNil(isNullable) && isNullable(subValue)) {
                    acc[key] = undefined;
                    return acc;
                }

                acc[key] =
                    transformer === undefined ? deepMap(subValue, subDesc) : transformer(subValue);

                return acc;
            }, {} as any);
    }

    return value;
}
