import { objectToBase64 } from '@common/utils/src/base64.ts';
import type { FilterModel } from '@frontend/ag-grid/src/types';
import {
    createNewFilterValue,
    getTableFilterValueFromState,
    parseFilterValue,
} from '@frontend/common/src/components/AgTable/helpers/columnsWithRouter';
import { useModule } from '@frontend/common/src/di/react';
import type { ETableIds } from '@frontend/common/src/modules/clientTableFilters/data';
import { ModuleRouter } from '@frontend/common/src/modules/router';
import { useSyncObservable } from '@frontend/common/src/utils/React/useSyncObservable';
import { useMemo } from 'react';

// TODO: reuse this hook in AgTableWithRouterSync and useSyncedTableFilter. Need regress for this big change
export const useUrlFilter = <TFilterModel extends FilterModel>(
    tableId: ETableIds | string,
    filterName: keyof TFilterModel,
) => {
    const { state$, setParams } = useModule(ModuleRouter);
    const state = useSyncObservable(state$);
    const filterFromUrl = useMemo(
        () => parseFilterValue(state?.route?.params.filter),
        [state?.route?.params.filter],
    );

    const tableFilter = useMemo(() => {
        return getTableFilterValueFromState(filterFromUrl, tableId) as TFilterModel;
    }, [filterFromUrl, tableId]);

    const filterModel = tableFilter?.[filterName];
    const value = filterModel
        ? filterModel?.filterType === 'set'
            ? filterModel?.values
            : filterModel?.filterType === 'text'
              ? filterModel.filter
              : filterModel.value
        : undefined;

    const updateFilter = (newFilterValue: Partial<TFilterModel>) => {
        const newFilter = createNewFilterValue(filterFromUrl, tableId, {
            ...tableFilter,
            ...newFilterValue,
        });
        setParams({
            filter: newFilter ? objectToBase64(newFilter) : undefined,
        });
    };

    return { value, state, updateFilter, filterFromUrl, tableFilter };
};
