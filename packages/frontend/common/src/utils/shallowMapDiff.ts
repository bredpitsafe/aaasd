import { isNil } from 'lodash-es';

import { EMPTY_MAP } from './const';

export type TShallowMapDiff<T> = {
    updated: T[];
    deleted: T[];
    added: T[];
};

export function shallowMapDiff<T>(
    keyProp: keyof T,
    base?: ReadonlyMap<T[keyof T], T>,
    compared?: ReadonlyMap<T[keyof T], T>,
    equalsComparer?: (a: T, b: T) => boolean,
): TShallowMapDiff<T> {
    const prevMap = base ?? EMPTY_MAP;
    const nextMap = compared ?? EMPTY_MAP;

    const added: T[] = [];
    const updated: T[] = [];
    const deleted: T[] = [];

    if (prevMap.size === 0) {
        return { added: Array.from(nextMap.values()), updated, deleted };
    }

    equalsComparer = equalsComparer ?? ((a: T, b: T) => a === b);

    for (const current of prevMap.values() as IterableIterator<T>) {
        const next = nextMap.get(current[keyProp]);
        if (isNil(next)) {
            deleted.push(current);
        } else if (!equalsComparer(next, current)) {
            updated.push(next);
        }
    }

    for (const current of nextMap.values() as IterableIterator<T>) {
        if (isNil(prevMap.get(current[keyProp]))) {
            added.push(current);
        }
    }

    return { added, updated, deleted };
}
