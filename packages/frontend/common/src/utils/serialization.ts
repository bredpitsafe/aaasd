import { isBoolean, isFunction, isNull, isNumber, isObject, isString } from 'lodash-es';

import type { IToStructurallyCloneable, TStructurallyCloneable } from '../types/serialization';

export function hasToStructurallyCloneable(value: unknown): value is IToStructurallyCloneable {
    return (
        isObject(value) &&
        has('toStructurallyCloneable', value) &&
        isFunction(value.toStructurallyCloneable)
    );
}

export function forceSerialize(value: unknown): TStructurallyCloneable {
    if (isNull(value)) return value;
    if (isString(value)) return value;
    if (isNumber(value)) return value;
    if (isBoolean(value)) return value;
    if (Array.isArray(value)) return value.map(forceSerialize);
    if (hasToStructurallyCloneable(value)) return value.toStructurallyCloneable();

    try {
        return JSON.parse(JSON.stringify(value));
    } catch (error) {
        return null;
    }
}

function has(key: string, x: object): x is { [key: string]: unknown } {
    return key in x;
}
