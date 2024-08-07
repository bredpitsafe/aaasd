import { every, isNil, isPlainObject } from 'lodash-es';

export function isDeepObjectEmpty<T>(value: T): boolean {
    if (isNil(value)) {
        return true;
    }

    if (Array.isArray(value)) {
        return value.length === 0;
    } else if (isPlainObject(value)) {
        return every(value as object, (item) => isDeepObjectEmpty(item));
    }

    return false;
}
