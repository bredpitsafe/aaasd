import { isEmpty } from 'lodash-es';
import { useMemo } from 'react';

import type { ETableIds } from '../../../modules/clientTableFilters/data';
import { useFunction } from '../../../utils/React/useFunction';
import { useSyncedTableFilter } from './useSyncedTableFilter';

const CaseInsensitiveMark = '(?i)';

export function useRegExpFilter(tableId: ETableIds | string): {
    serverRegex?: string;
    editableRegex?: string;
    caseSensitive?: boolean;
    filterValid: boolean;
    changeRegExp: (value: string) => void;
    toggleCaseSensitive: (flag?: boolean) => void;
} {
    const [filterRegexp, changeFilterRegexp] = useSyncedTableFilter(tableId, 'RegExp');

    const { regexp, caseSensitive } = useMemo(() => {
        if (isEmpty(filterRegexp) || filterRegexp === CaseInsensitiveMark) {
            return {
                regexp: undefined,
                caseSensitive: undefined,
            };
        }

        const caseInsensitive = filterRegexp!.startsWith(CaseInsensitiveMark);

        return {
            regexp: caseInsensitive
                ? filterRegexp!.substring(CaseInsensitiveMark.length)
                : filterRegexp,
            caseSensitive: !caseInsensitive,
        };
    }, [filterRegexp]);

    const filterValid = useMemo(() => {
        try {
            new RegExp(regexp || '');

            return true;
        } catch (e) {
            return false;
        }
    }, [regexp]);

    const changeRegExp = useFunction((value: string) => {
        const hasValue = !isEmpty(value);
        const currentCaseInsensitive = hasValue && value.startsWith(CaseInsensitiveMark);

        if (!hasValue) {
            changeFilterRegexp(undefined);
        } else if (!currentCaseInsensitive && (isEmpty(filterRegexp) || !caseSensitive)) {
            changeFilterRegexp(`${CaseInsensitiveMark}${value}`);
        } else {
            changeFilterRegexp(value);
        }
    });

    const toggleCaseSensitive = useFunction((flag = false) => {
        changeFilterRegexp(flag ? regexp : `${CaseInsensitiveMark}${regexp ?? ''}`);
    });

    return {
        serverRegex: filterRegexp !== CaseInsensitiveMark ? filterRegexp : undefined,
        editableRegex: regexp,
        caseSensitive,
        filterValid,
        changeRegExp,
        toggleCaseSensitive,
    };
}
