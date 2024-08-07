import { assert } from '@common/utils/src/assert.ts';

export type TShallowDiff<T> = {
    unchanged: T[];
    updated: T[];
    deleted: T[];
    added: T[];
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function shallowDiff<T extends Record<any, unknown>>(
    base: T,
    compared: T,
): TShallowDiff<keyof T> {
    assert(
        typeof base === 'object',
        'the first object to compare with shallowDiff needs to be an object',
    );
    assert(
        typeof compared === 'object',
        'the second object to compare with shallowDiff needs to be an object',
    );

    const unchanged: (keyof T)[] = [];
    const updated: (keyof T)[] = [];
    const deleted: (keyof T)[] = [];
    const added: (keyof T)[] = [];

    for (const key in compared) {
        if (!(key in base)) {
            added.push(key);

            // The updated items
        } else if (compared[key] !== base[key]) {
            updated.push(key);

            // And the unchanged
        } else if (compared[key] === base[key]) {
            unchanged.push(key);
        }
    }

    for (const key in base) {
        // To get the deleted items
        if (!(key in compared)) {
            deleted.push(key);
        }
    }

    return {
        added: added,
        updated: updated,
        deleted: deleted,
        unchanged: unchanged,
    };
}
