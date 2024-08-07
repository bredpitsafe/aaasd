export function createValueChangeDetector<T, K = T>(
    getCurrent: (data: T) => K = (data: T) => data as unknown as K,
    comparer: (prev: K, next: K) => boolean = (a, b) => a === b,
): (data: T) => boolean {
    let prev: K | undefined;
    let isFirst = true;

    return (data: T) => {
        if (isFirst) {
            prev = getCurrent(data);
            isFirst = false;
            return true;
        }

        const current = getCurrent(data);

        const result = !comparer(current, prev!);

        prev = current;

        return result;
    };
}
