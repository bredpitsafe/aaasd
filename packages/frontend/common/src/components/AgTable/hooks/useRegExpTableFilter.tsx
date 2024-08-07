import type {
    ColDef,
    GetDetailRowData,
    GridApi,
    IRowNode,
    ValueGetterParams,
} from '@frontend/ag-grid';
import { AgValue } from '@frontend/ag-grid/src/AgValue.ts';
import { EColumnFilterType } from '@frontend/ag-grid/src/types';
import {
    get,
    isBoolean,
    isEmpty,
    isFunction,
    isNil,
    isNumber,
    isString,
    isUndefined,
} from 'lodash-es';
import { useEffect, useMemo, useState } from 'react';

import type { ETableIds } from '../../../modules/clientTableFilters/data';
import { EMPTY_STRING } from '../../../utils/const';
import { useFunction } from '../../../utils/React/useFunction';
import { tryDo } from '../../../utils/tryDo.ts';
import { useSyncedTableFilter } from './useSyncedTableFilter.ts';

type TUseCommonFilterReturnType<T> = {
    isExternalFilterPresent: () => boolean;
    doesExternalFilterPass: (node: IRowNode<T>) => boolean;
    regExp: string;
    filterValid: boolean;
    templateExample: string | undefined;
    caseSensitive: boolean | undefined;
    toggleCaseSensitive: (value?: boolean) => void;
    setRegExp: (filter: string) => void;
};

const columnDelimiter = '\n';
const REGEXP_FLAGS = 'ms';
const REGEXP_FLAGS_CASE_INSENSITIVE = `${REGEXP_FLAGS}i`;

type TUseRegExpTableFilterParams<TRow, TNestedRow> = {
    gridApi: undefined | GridApi<TRow>;
    tableId: ETableIds;
    columns: ColDef<TRow>[];
    getDetailRowData?: GetDetailRowData<TRow, TNestedRow>;
    nestedColumns?: ColDef<TNestedRow>[];
};

export function useRegExpTableFilter<TRow, TNestedRow = {}>(
    params: TUseRegExpTableFilterParams<TRow, TNestedRow>,
): TUseCommonFilterReturnType<TRow> {
    const { tableId, columns, gridApi, getDetailRowData, nestedColumns } = params;

    const [_filter, setFilter] = useSyncedTableFilter<{
        regExp: string;
        caseSensitive: boolean;
    }>(tableId + '_CommonRegExp', 'RegExp+CaseSensitive');
    const regExp = _filter?.regExp ?? EMPTY_STRING;
    const caseSensitive = _filter?.caseSensitive ?? false;

    const [filterValid, setFilterValid] = useState(true);

    const filterRegExp = useMemo(() => {
        try {
            const inst = new RegExp(
                regExp,
                caseSensitive ? REGEXP_FLAGS : REGEXP_FLAGS_CASE_INSENSITIVE,
            );
            setFilterValid(true);
            return inst;
        } catch (e) {
            setFilterValid(false);
            return undefined;
        }
    }, [regExp, caseSensitive]);

    const filterableColumns = useMemo(() => getFilterableColumns<TRow>(columns), [columns]);
    const filterableNestedColumns = useMemo(
        () => getFilterableColumns<TNestedRow>(nestedColumns),
        [nestedColumns],
    );

    const filterableColumnsLength = filterableColumns.length + filterableNestedColumns.length;

    const cbIsExternalFilterPresent = useFunction(() => {
        return (
            regExp.length > 0 &&
            filterableColumnsLength > 0 &&
            filterValid &&
            filterRegExp !== undefined
        );
    });

    const cbDoesExternalFilterPass = useFunction((node: IRowNode<TRow>): boolean => {
        if (!node.data) {
            return false;
        }

        const template = getRegExpRowTemplate(filterableColumns, node.data as TRow);
        let nestedRows: TNestedRow[] = [];

        getDetailRowData?.({
            data: node.data,
            node,
            successCallback(rowData: TNestedRow[]): void {
                nestedRows = rowData;
            },
        });

        return nestedRows
            .map((row) => getRegExpRowTemplate(filterableNestedColumns, row))
            .concat(template)
            .some((t) => t && filterRegExp?.test(t));
    });

    const templateExample = useMemo(
        () => filterableColumns.map((col) => col.headerName).join(' '),
        [filterableColumns],
    );

    const setRegExp = useFunction((regExp: string) => {
        setFilter({ regExp, caseSensitive });
    });

    const toggleCaseSensitive = useFunction((state?: boolean) => {
        setFilter({ regExp, caseSensitive: state ?? !caseSensitive });
    });

    useEffect(() => gridApi?.onFilterChanged(), [gridApi, regExp, caseSensitive]);

    return {
        regExp,
        filterValid,
        templateExample,
        caseSensitive: isEmpty(regExp) ? undefined : caseSensitive,
        setRegExp,
        toggleCaseSensitive,
        isExternalFilterPresent: cbIsExternalFilterPresent,
        doesExternalFilterPass: cbDoesExternalFilterPass,
    };
}

function getFilterableColumns<T>(columns?: ColDef<T>[]) {
    return columns
        ? columns.filter(
              (col) =>
                  (col.field || col.valueGetter) &&
                  col.filter !== EColumnFilterType.number &&
                  col.filter !== EColumnFilterType.date,
          )
        : [];
}

export const getRegExpRowTemplate = <T, V extends ColDef<T>>(
    columns: V[],
    row: T,
): string | undefined => {
    let res = '';
    columns.forEach((col) => {
        if (isNil(col.field) && isNil(col.valueGetter)) {
            return;
        }

        const [, value] = tryDo<T>(() => {
            return isString(col.field)
                ? get(row, col.field)
                : isFunction(col.valueGetter)
                  ? col.valueGetter({ data: row } as ValueGetterParams<T>)
                  : undefined;
        });

        const data = valueToString(value);

        if (!isUndefined(data)) {
            res = res + data + columnDelimiter;
        }
    });

    return res;
};

function valueToString(data: unknown): string | undefined {
    if (isNil(data)) {
        return undefined;
    }

    if (isString(data)) {
        const trimmedValue = data.trim();

        if (trimmedValue === '') {
            return undefined;
        }

        return trimmedValue;
    }

    if (Array.isArray(data)) {
        if (data.length === 0) {
            return undefined;
        }

        const values = data
            .map((element) => valueToString(element))
            .filter((value) => !isUndefined(value));

        if (values.length === 0) {
            return undefined;
        }

        return values.join(' ');
    }

    if (isBoolean(data)) {
        return data ? 'On on True true' : 'Off off False false';
    }

    if (isNumber(data)) {
        return data.toLocaleString('en-US', { useGrouping: false, maximumFractionDigits: 20 });
    }

    if (data instanceof AgValue) {
        return data.toString();
    }

    return undefined;
}
