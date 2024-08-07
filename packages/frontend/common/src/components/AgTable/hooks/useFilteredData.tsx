import type { GridApi } from '@frontend/ag-grid';
import { useState } from 'react';

import { useFunction } from '../../../utils/React/useFunction';
import { useGridApiEvent } from './useGridApiEvent';

type TUseFilteredRowsReturnType<RecordType> = {
    filteredCount: number | undefined;
    getFilteredData: () => RecordType[];
};

export function useFilteredData<RecordType>(
    api: GridApi<RecordType> | undefined,
): TUseFilteredRowsReturnType<RecordType> {
    const [filteredCount, setFilteredCount] = useState(0);

    const onFilterChanged = useFunction(() => {
        const filteredCount = api?.getDisplayedRowCount();
        setFilteredCount(filteredCount ?? 0);
    });

    useGridApiEvent(api, onFilterChanged, 'filterChanged', 'rowDataUpdated');

    const getFilteredData = useFunction((): RecordType[] => {
        const res: RecordType[] = [];

        const rowType = api?.getModel().getType();

        switch (rowType) {
            case 'clientSide':
                api?.forEachNodeAfterFilter(
                    (node) => node.data !== undefined && res.push(node.data),
                );
                break;
            case 'infinite':
                api?.forEachNode((node) => node.data !== undefined && res.push(node.data));
                break;
            default:
                throw new Error(`Row type "${rowType}" is not supported`);
        }

        return res;
    });

    return {
        filteredCount,
        getFilteredData,
    };
}
