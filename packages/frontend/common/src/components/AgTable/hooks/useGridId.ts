import type { GridApi } from '@frontend/ag-grid';
import { useMemo } from 'react';

import type { TTableId } from '../../../modules/clientTableFilters/data.ts';
import { getGridId } from '../utils.ts';

export const useGridId = <RecordType>(gridApi?: GridApi<RecordType>): TTableId => {
    return useMemo(() => getGridId(gridApi), [gridApi]);
};
