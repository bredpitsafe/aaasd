import { assert } from '@common/utils/src/assert.ts';

export type TShallowArrayDiff<T> = {
    unchanged: T[];
    deleted: T[];
    added: T[];
};

export function shallowArrayDiff<T>(base: T[], compared: T[]): TShallowArrayDiff<T> {
    assert(
        Array.isArray(base),
        'the first arg to compare with shallowArrayDiff needs to be an array',
    );
    assert(
        Array.isArray(compared),
        'the second arg to compare with shallowArrayDiff needs to be an array',
    );

    const baseSet = new Set(base);
    const comparedSet = new Set(compared);

    const added: T[] = [];
    const deleted: T[] = [];
    const unchanged: T[] = [];

    for (const value of compared) {
        if (baseSet.has(value)) {
            unchanged.push(value);
        } else {
            added.push(value);
        }
    }

    for (const value of base) {
        if (!comparedSet.has(value)) {
            deleted.push(value);
        }
    }

    return {
        added: added,
        deleted: deleted,
        unchanged: unchanged,
    };
}
