import { assert } from '@common/utils/src/assert.ts';
import { isEqual } from 'lodash-es';

export type TDeepDiff<T> = {
    unchanged: T[];
    updated: T[];
    deleted: T[];
    added: T[];
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function deepDiff<T extends Record<any, unknown>>(base: T, compared: T): TDeepDiff<keyof T> {
    assert(
        typeof base === 'object',
        'the first object to compare with deepDiff needs to be an object',
    );
    assert(
        typeof compared === 'object',
        'the second object to compare with deepDiff needs to be an object',
    );

    const unchanged: (keyof T)[] = [];
    const updated: (keyof T)[] = [];
    const deleted: (keyof T)[] = [];
    const added: (keyof T)[] = [];

    for (const key in compared) {
        if (!(key in base)) {
            added.push(key);

            // The unchanged items
        } else if (isEqual(compared[key], base[key])) {
            unchanged.push(key);
            // The updated items
        } else {
            updated.push(key);
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
