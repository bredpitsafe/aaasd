import { objectToBase64 } from '@common/utils/src/base64.ts';
import type { GridApi } from '@frontend/ag-grid';
import { Events } from '@frontend/ag-grid';
import { isEmpty, isNil, isUndefined } from 'lodash-es';
import { useEffect, useMemo } from 'react';

import { useModule } from '../../../di/react';
import { ModuleRouter } from '../../../modules/router';
import { useFunction } from '../../../utils/React/useFunction';
import { useSyncObservable } from '../../../utils/React/useSyncObservable';
import { useSyncState } from '../../../utils/React/useSyncState';
import { Binding } from '../../../utils/Tracing/Children/Binding.ts';
import {
    createNewFilterValue,
    getTableFilterValueFromState,
    parseFilterValue,
} from '../helpers/columnsWithRouter.ts';
import { agTableLogger } from '../logger.ts';
import { useGridApiEvent } from './useGridApiEvent';
import { useGridId } from './useGridId.ts';
import { useGridIsInitialized } from './useGridIsInitialized.ts';

export function useGridFilterState<RecordType>(gridApi: GridApi<RecordType> | undefined) {
    const tableId = useGridId(gridApi);
    const logger = useMemo(
        () => agTableLogger.child([new Binding('FilterState'), new Binding(tableId)]),
        [tableId],
    );

    const { state$, setParams } = useModule(ModuleRouter);
    const state = useSyncObservable(state$);

    const filter = state?.route?.params.filter;

    const filterFromUrl = useMemo(() => parseFilterValue(filter), [filter]);

    const filterModel = useMemo(
        () => getTableFilterValueFromState(filterFromUrl, tableId),
        [filterFromUrl, tableId],
    );

    const gridReady = useGridIsInitialized(gridApi);
    const [gridFilterReady, setGridFilterReady] = useSyncState(false, [gridApi]);

    useEffect(() => {
        if (isNil(gridApi) || !gridReady) {
            return;
        }

        if (!isUndefined(filterModel)) {
            logger.trace('set filter model', filterModel);
            gridApi.setFilterModel(filterModel);
        }

        setGridFilterReady(true);
        logger.trace('set filter ready');
    }, [gridApi, filterModel, gridReady, setGridFilterReady, logger]);

    useGridApiEvent(
        gridApi,
        useFunction(async () => {
            if (isNil(gridApi) || !gridFilterReady) {
                return;
            }

            const columns = gridApi.getColumnDefs();
            if (isEmpty(columns)) {
                return;
            }

            const newFilterModel = gridApi.getFilterModel();
            const newFilter = createNewFilterValue(filterFromUrl, tableId, newFilterModel);

            logger.trace('new filter, set URL param', newFilter);
            await setParams({ filter: newFilter ? objectToBase64(newFilter) : undefined });
        }),
        Events.EVENT_FILTER_CHANGED,
    );
}
