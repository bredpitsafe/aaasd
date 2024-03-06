import type { SelectProps } from '@frontend/common/src/components/Select';
import { useSyncedTableFilter } from '@frontend/common/src/components/Table/helpers/useSyncedTableFilter';
import { ETableIds } from '@frontend/common/src/modules/clientTableFilters/data';
import { EInstrumentKindType, TInstrument } from '@frontend/common/src/types/domain/instrument';
import { useDebouncedFunction } from '@frontend/common/src/utils/React/useDebouncedFunction';
import { GridApi } from 'ag-grid-community';
import { isNil } from 'lodash-es';
import { useEffect } from 'react';

import { KIND_COL_ID } from '../columns';

const APPLY_GRID_FILTER_DEBOUNCE = 1_000;

const options: SelectProps<EInstrumentKindType>['options'] = Object.values(EInstrumentKindType).map(
    (value) => ({
        value,
        label: value,
    }),
);
export const useInstrumentKind = (gridApi: GridApi<TInstrument> | undefined) => {
    const [kind, setKind] = useSyncedTableFilter<EInstrumentKindType | undefined>(
        `${ETableIds.AllInstruments}_kind`,
        'kind',
    );

    const cbSyncGridFilter = useDebouncedFunction(() => {
        const colFilter = gridApi?.getFilterInstance(KIND_COL_ID);
        colFilter?.setModel(isNil(kind) ? undefined : { values: [kind] });
        gridApi?.onFilterChanged();
    }, APPLY_GRID_FILTER_DEBOUNCE);

    // Sync Grid Filter with external filter when kind changes (with debounce delay)
    useEffect(cbSyncGridFilter, [cbSyncGridFilter, kind]);

    return { options, kind, setKind };
};
