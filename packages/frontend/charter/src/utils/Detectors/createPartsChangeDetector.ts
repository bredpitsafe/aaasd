import type { TPart } from '../../../lib/Parts/def';

const defaultGetCurrent = <T>(parts: TPart[]) => {
    return parts.reduce((sum, p) => sum + p.tsUpdate, 0) as unknown as T;
};
const defaultComparer = <T>(a: T, b: T) => a === b;

export function createPartsChangeDetector<T>(
    getCurrent: (parts: TPart[]) => T = defaultGetCurrent,
    comparer: (a: T, b: T) => boolean = defaultComparer,
): (parts: TPart[]) => boolean {
    let prevLength = 0;
    let prevValue: T;

    return function partsChangeDetector(parts: TPart[]) {
        if (prevLength !== parts.length) {
            prevLength = parts.length;
            prevValue = getCurrent(parts);
            return true;
        }

        const current = getCurrent(parts);
        const result = !comparer(prevValue, current);

        prevValue = current;

        return result;
    };
}
