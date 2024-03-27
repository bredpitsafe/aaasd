export function binarySearch(low: number, high: number, comparator: (index: number) => number) {
    const min = low;
    const max = high;

    if (max < min) throw new RangeError('invalid bounds');

    let mid;
    let cmp;
    let absCmp;
    let diff = Infinity;
    let best = -1;

    while (low <= high) {
        // The naive `low + high >>> 1` could fail for array lengths > 2**31
        // because `>>>` converts its operands to int32. `low + (high - low >>> 1)`
        // works for array lengths <= 2**32-1 which is also Javascript's max array
        // length.
        mid = low + ((high - low) >>> 1);
        cmp = comparator(mid);
        absCmp = Math.abs(cmp);

        if (absCmp < diff) {
            diff = absCmp;
            best = mid;
        }

        // Too low.
        if (cmp < 0) low = mid + 1;
        // Too high.
        else if (cmp > 0) high = mid - 1;
        // Key found.
        else break;
    }

    return best;
}

export function findLeftClosestIndex(
    needle: number,
    items: number[],
    step = 1,
    offset = 0,
    low = 0,
    high = Math.max(0, items.length / step - 1),
) {
    let best = binarySearch(low, high, (i: number) => items[i * step + offset] - needle);

    while (best > 0 && items[(best - 1) * step + offset] === items[best * step + offset]) {
        best--;
    }

    return best;
}

export function findRightIndexByEqual(
    leftIndex: number,
    items: number[],
    step = 1,
    offset = 0,
): number {
    if (leftIndex < 0) {
        return leftIndex;
    }

    const size = items.length / step;

    while (
        leftIndex < size - 1 &&
        items[(leftIndex + 1) * step + offset] === items[leftIndex * step + offset]
    ) {
        leftIndex++;
    }

    return leftIndex;
}

export const decreaseIndexWhileBigger = (
    edge: number,
    index: number,

    items: number[],
    step = 1,
    offset = 0,
) => {
    const size = items.length / step;

    while (true) {
        if (index === -1 || index >= size) return -1;
        if (items[index * step + offset] <= edge) return index;
        else index--;
    }
};

export const increaseIndexWhileLower = (
    edge: number,
    index: number,

    items: number[],
    step = 1,
    offset = 0,
) => {
    const size = items.length / step;

    while (true) {
        if (index === -1 || index >= size) return -1;
        if (items[index * step + offset] >= edge) return index;
        else index++;
    }
};

export const decreaseIndexWhileEqual = (index: number, items: number[], step = 1, offset = 0) => {
    while (
        index >= 0 &&
        numbersEquals(items[index * step + offset], items[(index - 1) * step + offset])
    ) {
        index--;
    }

    return index;
};

export const increaseIndexWhileEqual = (index: number, items: number[], step = 1, offset = 0) => {
    if (index === -1) {
        return -1;
    }

    const size = items.length / step;
    while (
        index < size &&
        numbersEquals(items[index * step + offset], items[(index + 1) * step + offset])
    ) {
        index++;
    }

    return index;
};

export const findFirstLeftNotEqualTo = (
    value: number,
    index: number,
    items: number[],
    step = 1,
    offset = 0,
) => {
    while (index >= 0 && numbersEquals(items[index * step + offset], value)) {
        index--;
    }

    return index;
};

export const findFirstRightNotEqualTo = (
    value: number,
    index: number,
    items: number[],
    step = 1,
    offset = 0,
) => {
    if (index === -1) {
        return -1;
    }
    const size = items.length / step;

    while (index < size && numbersEquals(items[index * step + offset], value)) {
        index++;
    }

    if (index === size) {
        return -1;
    }

    return index;
};

function numbersEquals(a: number, b: number): boolean {
    // Number.isNaN(undefined) === false, but isNaN(undefined) === true
    if (Number.isNaN(a) && Number.isNaN(b)) {
        return true;
    }

    return a === b;
}
