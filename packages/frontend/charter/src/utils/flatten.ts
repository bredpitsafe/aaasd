export function flatten<T>(items: T[][]): T[] {
    // @ts-ignore
    return [].concat(...items);
}
