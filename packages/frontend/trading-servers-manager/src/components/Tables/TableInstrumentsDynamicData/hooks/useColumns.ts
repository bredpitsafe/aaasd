import type {
    TInstrumentDynamicData,
    TInstrumentDynamicDataPriceStepRules,
    TInstrumentDynamicDataStatus,
} from '@backend/bff/src/modules/instruments/schemas/defs.ts';
import type { TimeZone } from '@common/types';
import type { ColDef, ValueFormatterParams, ValueGetterParams } from '@frontend/ag-grid';
import { FLOATING_TEXT_FILTER } from '@frontend/ag-grid/src/filters.ts';
import { cnNoPaddingCell } from '@frontend/common/src/components/AgTable/AgTable.css.ts';
import { getTimeColumn } from '@frontend/common/src/components/AgTable/columns/getTimeColumn.ts';
import { dynamicDataStatusToDisplayStatus } from '@frontend/common/src/utils/instruments/converters.ts';
import { getInstrumentStepQty } from '@frontend/common/src/utils/instruments/getInstrumentStepQty.ts';
import { isNil } from 'lodash-es';
import { useMemo } from 'react';

import { WidgetInstrumentNameRenderer } from '../../../../widgets/WidgetInstrumentNameRenderer.tsx';
import { getDisplayPriceStepRules } from '../../utils/instruments.ts';
import { StatusRenderer } from '../StatusRenderer.tsx';
import { StepPriceRenderer } from '../StepPriceRenderer.tsx';

export function useColumns(timeZone: TimeZone): ColDef<TInstrumentDynamicData>[] {
    return useMemo(
        () => [
            {
                field: 'id',
                headerName: 'ID',
            },
            {
                field: 'name',
                headerName: 'Name',
                sortable: true,
                cellRenderer: WidgetInstrumentNameRenderer,
                sort: 'asc',
                ...FLOATING_TEXT_FILTER,
            },
            {
                field: 'status',
                headerName: 'Status',
                sortable: true,
                cellRenderer: StatusRenderer,
                cellClass: cnNoPaddingCell,
                valueFormatter: ({
                    value,
                }: ValueFormatterParams<TInstrumentDynamicData, TInstrumentDynamicDataStatus>) =>
                    isNil(value) ? '' : dynamicDataStatusToDisplayStatus(value),
                useValueFormatterForExport: true,
            },

            {
                field: 'minPrice',
                headerName: 'Min. Price',
            },
            {
                field: 'maxPrice',
                headerName: 'Max. Price',
            },
            {
                field: 'minQty',
                headerName: 'Min. Qty',
            },
            {
                field: 'maxQty',
                headerName: 'Max. Qty',
            },
            {
                field: 'minVolume',
                headerName: 'Min. Volume',
            },
            {
                field: 'priceStepRules',
                headerName: 'Step Price',
                cellRenderer: StepPriceRenderer,
                valueFormatter: ({
                    value,
                }: ValueFormatterParams<
                    TInstrumentDynamicData,
                    TInstrumentDynamicDataPriceStepRules
                >) => (isNil(value) ? '' : getDisplayPriceStepRules(value)),
                useValueFormatterForExport: true,
            },
            {
                colId: 'stepQty',
                headerName: 'Step Qty',
                valueGetter({ data }: ValueGetterParams<TInstrumentDynamicData>) {
                    return isNil(data) ? undefined : getInstrumentStepQty(data.amountStepRules);
                },
            },
            {
                ...getTimeColumn('platformTime', 'Platform Time', timeZone),
                sortable: true,
            },
        ],
        [timeZone],
    );
}
