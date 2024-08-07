import type { Hours, Milliseconds, TimeZone } from '@common/types';
import { getNowDayjs, getNowMilliseconds, hours2milliseconds, plus } from '@common/utils';
import { isNil } from 'lodash-es';
import type { Dispatch } from 'react';
import { useMemo, useRef } from 'react';
import { usePrevious } from 'react-use';

import type { TProductLogSubscriptionFilters } from '../../modules/actions/productLogs/defs.ts';
import { allProductLogLevels } from '../../modules/actions/productLogs/defs.ts';
import { useFunction } from '../../utils/React/useFunction';
import { useLocalStorage } from '../../utils/React/useLocalStorage';

const EXP_DELAY = hours2milliseconds(2 as Hours);

export function useProductLogFiltersWithExpiration(localStorageKey: string, timeZone: TimeZone) {
    const [expiration, setExpiration] = useExpirationDate(localStorageKey);
    const extendExpiration = useFunction(() =>
        setExpiration(plus(getNowMilliseconds(), EXP_DELAY)),
    );
    const [storageFilters, setFilters] = useLocalStorage<TProductLogSubscriptionFilters>(
        localStorageKey + '_useProductLogFiltersWithExpiration',
    );

    const shouldReset = storageFilters === undefined || expiration < getNowMilliseconds();
    const filters = useMemo(
        () => (shouldReset ? getDefaultFilters(timeZone) : storageFilters),
        [shouldReset, storageFilters, timeZone],
    );

    // If we open component with big delay we should reset clientTableFilters
    if (shouldReset) {
        setFilters(filters);
    }

    // While we use this component we shouldn't reset clientTableFilters
    extendExpiration();

    return { filters, setFilters, extendExpiration };
}

function useExpirationDate(_key: string): [Milliseconds, Dispatch<Milliseconds>] {
    const key = _key + '_useExpirationDate';
    const value = useRef<Milliseconds | undefined>(undefined);

    if (usePrevious(key) !== key) {
        value.current = undefined;
    }

    if (isNil(value.current)) {
        const exp = Number(localStorage.getItem(key));
        value.current = (isNaN(exp) ? 0 : exp) as Milliseconds;
    }

    const set = useFunction((v: Milliseconds) => {
        value.current = v;
        key && localStorage.setItem(key, String(v));
    });

    return [value.current, set];
}

function getDefaultFilters(timeZone: TimeZone): TProductLogSubscriptionFilters {
    return {
        since: getNowDayjs(timeZone).startOf('day').valueOf() as Milliseconds,
        include: {
            level: allProductLogLevels.slice(),
        },
    };
}
