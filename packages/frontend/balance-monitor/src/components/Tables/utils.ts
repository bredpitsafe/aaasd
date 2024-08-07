import type { ISO, Nil, TimeZone } from '@common/types';
import { toDayjsWithTimezone } from '@common/utils';
import type {
    ColDef,
    IDateFilterParams,
    ValueFormatterParams,
    ValueGetterParams,
} from '@frontend/ag-grid';
import { EColumnFilterType } from '@frontend/ag-grid/src/types';
import { type TAmount } from '@frontend/common/src/types/domain/balanceMonitor/defs';
import BigDecimal from 'js-big-decimal';
import { capitalize, isEmpty, isNil, isString, lowerCase } from 'lodash-es';

export const FLOATING_TEXT_FILTER: Pick<
    ColDef,
    'floatingFilter' | 'floatingFilterComponentParams' | 'filter'
> = {
    floatingFilter: true,
    floatingFilterComponentParams: { suppressFilterButton: true },
    filter: EColumnFilterType.text,
};

export const FLOATING_NUMBER_FILTER: Pick<
    ColDef,
    'floatingFilter' | 'floatingFilterComponentParams' | 'filter'
> = {
    floatingFilter: true,
    filter: EColumnFilterType.number,
};

export const FLOATING_SET_FILTER: Pick<ColDef, 'floatingFilter' | 'filter'> = {
    floatingFilter: true,
    filter: EColumnFilterType.set,
};

export const getFloatingStatusFilter = (
    values: string[],
): Pick<
    ColDef,
    'floatingFilter' | 'floatingFilterComponentParams' | 'filter' | 'filterParams'
> => ({
    ...FLOATING_SET_FILTER,
    filterParams: {
        values,

        suppressSorting: true,
    },
});

export const FLOATING_DATE_FILTER: Pick<ColDef, 'floatingFilter' | 'filter'> = {
    floatingFilter: true,
    filter: EColumnFilterType.date,
};

export function formatAmountOrEmptyWithoutGroups(
    value: TAmount | null | undefined,
    digits?: number,
): string {
    if (isNil(value)) {
        return '—';
    }

    const bigDecimal = new BigDecimal(value);

    return (
        isNil(digits) ? bigDecimal : bigDecimal.round(digits, BigDecimal.RoundingModes.FLOOR)
    ).getPrettyValue(undefined, '');
}

export function keyToField<T>(key: keyof T | ((row: T) => string), label?: string) {
    return {
        label: label ?? (isString(key) ? capitalize(lowerCase(key)) : undefined) ?? 'Table Column',
        value: key,
    };
}

export function valueOrArrayKeyToField<T>(key: (row: T) => string | string[], label?: string) {
    return keyToField((row: T) => {
        const value = key(row);
        return Array.isArray(value) ? value.join(' ') : capitalize(value);
    }, label);
}

export function createRowIndexColumn<T extends object>(): ColDef<T> {
    return {
        colId: 'rowIndex',
        headerName: '#',
        valueGetter: ({ node }: ValueGetterParams) => (node?.rowIndex ?? 0) + 1,
        width: 20,
        initialHide: true,
    };
}

export function formatSingleValueOrArray<T>({
    value,
}: ValueFormatterParams<T, Nil | string | string[]>): string {
    return Array.isArray(value) ? value.join(', ') : value ?? '';
}

export function getIsoDateFilterParams(timeZone: TimeZone): IDateFilterParams {
    return {
        comparator: (filterDate: Date, cellValue: ISO): number => {
            if (isEmpty(cellValue)) {
                return -1;
            }

            const cellDate = toDayjsWithTimezone(cellValue, timeZone);

            const filterYear = filterDate.getFullYear();
            const cellYear = cellDate.year();

            if (filterYear !== cellYear) {
                return cellYear - filterYear;
            }

            const filterMonth = filterDate.getMonth();
            const cellMonth = cellDate.month();

            if (filterMonth !== cellMonth) {
                return cellMonth - filterMonth;
            }

            const filterDay = filterDate.getDate();
            const cellDay = cellDate.date();

            return filterDay !== cellDay ? cellDay - filterDay : 0;
        },
    };
}
