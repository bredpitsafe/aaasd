import type { GridReadyEvent } from 'ag-grid-community';
import type { FilterChangedEvent } from 'ag-grid-community/dist/lib/events';
import { isEmpty, isNil } from 'lodash-es';
import { ReactElement, useEffect, useMemo } from 'react';
import { useObservable } from 'react-use';

import { useModule } from '../../di/react';
import type { ETableIds } from '../../modules/clientTableFilters/data';
import { ModuleTypicalRouter } from '../../modules/router';
import { objectToBase64 } from '../../utils/base64';
import { useFunction } from '../../utils/React/useFunction';
import { useSyncState } from '../../utils/React/useSyncState';
import {
    createNewFilterValue,
    getTableFilterValueFromState,
    parseFilterValue,
} from '../Table/helpers/columnsWithRouter';
import { AgTable, TAgTableProps } from './AgTable';
import { useGetContextMenuItems } from './hooks/useGetContextMenuItems';
import { useGridApi } from './hooks/useGridApi';
import { useGridState } from './hooks/useGridState';

type TAgTableWithRouterSyncProps<RecordType> = TAgTableProps<RecordType> & {
    id: ETableIds;
    includeDefaultContextMenuItems?: boolean;
};

export function AgTableWithRouterSync<RecordType>(
    props: TAgTableWithRouterSyncProps<RecordType>,
): ReactElement {
    const {
        id,
        onFilterChanged,
        onGridReady: onGridReadyProps,
        getContextMenuItems,
        includeDefaultContextMenuItems,
        onFirstDataRendered,
        ...restProps
    } = props;
    const { state$, setParams } = useModule(ModuleTypicalRouter);
    const state = useObservable(state$);
    const { gridApi, columnApi, onGridReady: onGridReadyApi } = useGridApi<RecordType>();

    const { copyTableState } = useGridState(
        id,
        gridApi,
        columnApi,
        props.rowModelType === 'infinite',
    );

    const filterFromUrl = useMemo(
        // @ts-expect-error
        () => parseFilterValue(state?.route?.params.filter),
        // @ts-expect-error
        [state?.route?.params.filter],
    );

    const filterModel = useMemo(
        () => getTableFilterValueFromState(filterFromUrl, id),
        [filterFromUrl, id],
    );

    const cbGridReady = useFunction((event: GridReadyEvent<RecordType>) => {
        onGridReadyApi(event);
        onGridReadyProps?.(event);
    });

    // Set filter is not working for early setFilterModel if AgGrid queues filter update. This is workaround for this issue
    const [firstDataRendered, setFirstDataRendered] = useSyncState(
        props.rowModelType === 'infinite' || props.rowModelType === 'serverSide',
        [props.rowModelType],
    );

    const handleFirstDataRendered = useFunction((e) => {
        onFirstDataRendered?.(e);
        setFirstDataRendered(true);
    });

    useEffect(() => {
        if (!isNil(gridApi) && firstDataRendered && filterModel !== undefined) {
            gridApi.setFilterModel(filterModel);
        }
    }, [gridApi, filterModel, firstDataRendered]);

    const cbFilterChanged = useFunction(async (event: FilterChangedEvent<RecordType>) => {
        if (isEmpty(event.columns)) {
            return;
        }

        const newFilterModel = event.api.getFilterModel();
        const newFilter = createNewFilterValue(filterFromUrl, id, newFilterModel);

        await setParams({
            filter: newFilter ? objectToBase64(newFilter) : undefined,
        });

        onFilterChanged?.(event);
    });

    const getContextMenuItemsHandle = useGetContextMenuItems<RecordType>({
        getContextMenuItems,
        onCopyTableState: copyTableState,
        includeDefaultContextMenuItems,
    });

    return (
        <AgTable
            onFilterChanged={cbFilterChanged}
            onGridReady={cbGridReady}
            getContextMenuItems={getContextMenuItemsHandle}
            onFirstDataRendered={handleFirstDataRendered}
            {...restProps}
        />
    );
}
