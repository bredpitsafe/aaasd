import type { Entries } from 'type-fest';

export function isDefined<T>(value: T): value is Exclude<T, undefined> {
    return value !== null && value !== undefined;
}

export const typedObjectEntries = <T extends Record<string, unknown>>(obj: T) =>
    Object.entries(obj) as Entries<T>;
