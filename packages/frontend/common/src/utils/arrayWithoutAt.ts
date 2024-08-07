export function arrayWithoutAt<T>(v: T[], index: number): T[] {
    return v.slice(0, index).concat(v.slice(index + 1));
}
