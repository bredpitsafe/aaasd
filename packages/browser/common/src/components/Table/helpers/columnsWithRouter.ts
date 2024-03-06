import { omitBy } from 'lodash-es';
import { Key } from 'react';

import {
    ETableIds,
    TFilterTableValue,
    TFilterValue,
} from '../../../modules/clientTableFilters/data';
import { base64ToObject, TBase64 } from '../../../utils/base64';
import { tryDo } from '../../../utils/tryDo';

export function parseFilterValue(filterBase64: TBase64<TFilterValue> | undefined): TFilterValue {
    if (!filterBase64) {
        return {};
    }
    try {
        return base64ToObject<TFilterValue>(filterBase64);
    } catch {
        return {};
    }
}

export function getTableFilterValueFromState(
    filter: TFilterValue | undefined,
    tableId: ETableIds | string,
): TFilterTableValue | undefined {
    return filter?.[tableId] || undefined;
}

export function createNewFilterValue(
    filter: TFilterValue,
    tableId: ETableIds | string,
    newValue: object | undefined,
): TFilterValue | undefined {
    const newFilter = omitEmptyObjects({
        ...filter,
        [tableId]: newValue,
    }) as TFilterValue;

    if (Object.keys(newFilter).length === 0) {
        return undefined;
    }

    return newFilter;
}

export function parseSelectedKeys<T>(key: Key | void, fallback: T): T {
    return tryDo<T>(() => JSON.parse(key as string))[1] || fallback;
}

export function stringifySelectedKeys<T>(value: T): string[] {
    return [JSON.stringify(value)];
}

function omitEmptyObjects(obj: object): object {
    return omitBy(obj, (value) => Object.keys(value).length === 0);
}
