import type { TPrimitive } from '@common/types';
import { isPrimitive } from '@common/utils';

import { hashString } from './hashString';

export type NonPrimitiveTransformers<T> = {
    [K in keyof T as T[K] extends TPrimitive ? never : K]: (value: T[K]) => TPrimitive;
};

export function structHash<T extends object, D extends NonPrimitiveTransformers<Required<T>>>(
    struct: T,
    descriptors: D,
): number {
    const string = Object.keys(struct)
        .sort()
        .map(
            (key) => {
                const value = struct[key as keyof T];
                return String(
                    isPrimitive(value) ? value : descriptors[key as keyof T](value as any),
                );
            },
            [] as (string | number)[],
        )
        .join('/');

    return hashString(string);
}
