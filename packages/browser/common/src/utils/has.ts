export function has<T extends object>(
    target: T,
    key: string,
): target is T & { [key: string]: unknown } {
    return Object.prototype.hasOwnProperty.call(target, key);
}
