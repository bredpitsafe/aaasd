import { isPlainObject, mapKeys, mapValues } from 'lodash-es';

export function deepMapKeys<R extends object | unknown[]>(
    obj: Record<string, unknown> | Array<unknown> | unknown,
    cb: (key: string) => string,
): R {
    if (Array.isArray(obj)) {
        return obj.map((item) => deepMapKeys(item, cb)) as R;
    }

    if (isPlainObject(obj)) {
        return mapValues(
            mapKeys(obj as object, (_, key) => cb(key)),
            (value) => deepMapKeys(value, cb),
        ) as R;
    }

    return obj as R;
}
