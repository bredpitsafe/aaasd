export function isClamped(v: number, left: number, right: number): boolean {
    return v >= left && v <= right;
}
