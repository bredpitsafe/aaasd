import { objectToBase64 } from '@common/utils/src/base64.ts';
import { isNil } from 'lodash-es';
import { useMemo } from 'react';

import { useModule } from '../../../di/react';
import type { ETableIds } from '../../../modules/clientTableFilters/data';
import { ModuleRouter } from '../../../modules/router';
import { useFunction } from '../../../utils/React/useFunction';
import { useSyncObservable } from '../../../utils/React/useSyncObservable';
import {
    createNewFilterValue,
    getTableFilterValueFromState,
    parseFilterValue,
} from '../helpers/columnsWithRouter';

type TUseTableFilterReturnType<T> = [T | undefined, (newValue?: T) => void];
export function useSyncedTableFilter<T = string>(
    tableId: ETableIds | string,
    filterName: string,
): TUseTableFilterReturnType<T> {
    const { state$, setParams } = useModule(ModuleRouter);
    const state = useSyncObservable(state$);
    const filter = useMemo(
        () => parseFilterValue(state?.route?.params.filter),
        [state?.route?.params.filter],
    );
    const tableFilter = useMemo(() => {
        return getTableFilterValueFromState(filter, tableId);
    }, [filter, tableId]);

    const value = tableFilter?.[filterName]?.value;

    const setFilter = useFunction((value?: T) => {
        const newFilter = createNewFilterValue(filter, tableId, {
            ...tableFilter,
            [filterName]: isNil(value) || value === '' ? undefined : { value },
        });

        return setParams({
            filter: newFilter !== undefined ? objectToBase64(newFilter) : undefined,
        });
    });

    return [value, setFilter];
}
