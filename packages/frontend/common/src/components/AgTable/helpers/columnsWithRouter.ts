import type { TBase64 } from '@common/utils/src/base64.ts';
import { base64ToObject } from '@common/utils/src/base64.ts';
import { omitBy } from 'lodash-es';

import type {
    ETableIds,
    TFilterTableValue,
    TFilterValue,
} from '../../../modules/clientTableFilters/data';

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

function omitEmptyObjects(obj: object): object {
    return omitBy(obj, (value) => Object.keys(value).length === 0);
}
