import { capitalize, isString, lowerCase } from 'lodash-es';

export function keyToField<T>(key: keyof T | ((row: T) => string), label?: string) {
    return {
        label: label ?? (isString(key) ? capitalize(lowerCase(key)) : undefined) ?? 'Table Column',
        value: key,
    };
}
