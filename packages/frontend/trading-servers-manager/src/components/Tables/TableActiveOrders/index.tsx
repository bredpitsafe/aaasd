import type { Milliseconds, TimeZone } from '@common/types';
import { EDateTimeFormats } from '@common/types';
import { toDayjsWithTimezone } from '@common/utils';
import type { ColDef } from '@frontend/ag-grid';
import type {
    EAgGridTextFilterType,
    TAgGridRadioFilter,
    TAgGridTextFilter,
} from '@frontend/ag-grid/src/types';
import { EColumnFilterType } from '@frontend/ag-grid/src/types';
import { ordersSortableFields } from '@frontend/common/src/actors/TradingServersManager/modules/actions/utils.ts';
import { AgTableWithRouterSync } from '@frontend/common/src/components/AgTable/AgTableWithRouterSync';
import {
    createColumnRadioFilter,
    createColumnRadioFloatingFilter,
} from '@frontend/common/src/components/AgTable/columns/ColumnRadioFilter/ColumnRadioFilter';
import { dateFormatter } from '@frontend/common/src/components/AgTable/formatters/date';
import { useFilteredData } from '@frontend/common/src/components/AgTable/hooks/useFilteredData';
import { useGridApi } from '@frontend/common/src/components/AgTable/hooks/useGridApi';
import type { TUseInfinityDataSourceProps } from '@frontend/common/src/components/AgTable/hooks/useInfinityDataSource';
import { useInfinityDataSource } from '@frontend/common/src/components/AgTable/hooks/useInfinityDataSource';
import { useRowSelection } from '@frontend/common/src/components/AgTable/hooks/useRowSelection';
import { SideRenderer } from '@frontend/common/src/components/AgTable/renderers/SideRenderer';
import { isoGetter } from '@frontend/common/src/components/AgTable/valueGetters/iso';
import { TableLabelLastUpdate } from '@frontend/common/src/components/TableLabel/LastUpdate';
import { TableLabelExportData } from '@frontend/common/src/components/TableLabel/TableLabelExportData';
import { TableLabels } from '@frontend/common/src/components/TableLabel/TableLabels';
import { ETableIds } from '@frontend/common/src/modules/clientTableFilters/data';
import type { TWithClassname } from '@frontend/common/src/types/components';
import type { TActiveOrder } from '@frontend/common/src/types/domain/orders';
import { EOrderSide, EOrderTimeInForce } from '@frontend/common/src/types/domain/orders';
import { fixedLengthNumber } from '@frontend/common/src/utils/fixedLengthNumber';
import { useFunction } from '@frontend/common/src/utils/React/useFunction';
import cn from 'classnames';
import { capitalize, isNil, isString, lowerCase } from 'lodash-es';
import type { ReactElement } from 'react';
import { useMemo } from 'react';

import { cnRoot } from '../view.css';
import { AgeRenderer } from './components/AgeRenderer';
import { cnTableActionsFiller, cnTableContainer } from './style.css';

type TTableActiveOrderProps = TWithClassname &
    TUseInfinityDataSourceProps<TActiveOrder, TTableActiveOrdersFilterModel> & {
        timeZone: TimeZone;
        updateTime: undefined | Milliseconds;
        exportFilename: string;
    };

export function TableActiveOrders(props: TTableActiveOrderProps): ReactElement | null {
    const { gridApi, onGridReady } = useGridApi<TActiveOrder>();

    const columns = useColumns(props.timeZone);
    const { selectedRows, onSelectionChanged } = useRowSelection<TActiveOrder>();
    const { getFilteredData } = useFilteredData(gridApi);

    const dataSource = useInfinityDataSource(gridApi, props);

    const handleGetCSVOptions = useFunction(() => getCSVOptions(props.timeZone));

    return (
        <div className={cn(props.className, cnRoot, cnTableContainer)}>
            <TableLabels>
                <div className={cnTableActionsFiller} />
                <TableLabelLastUpdate time={props.updateTime} timeZone={props.timeZone} />
                <TableLabelExportData
                    selectedRows={selectedRows}
                    getData={getFilteredData}
                    filename={props.exportFilename}
                    getOptions={handleGetCSVOptions}
                />
            </TableLabels>
            <AgTableWithRouterSync
                id={ETableIds.ActiveOrders}
                rowKey="orderId"
                columnDefs={columns}
                rowSelection="multiple"
                onSelectionChanged={onSelectionChanged}
                onGridReady={onGridReady}
                {...dataSource}
            />
        </div>
    );
}

async function getCSVOptions(timeZone: TimeZone) {
    const fields = [
        createField('accountName', 'Account'),
        createField('instrumentName', 'Instrument'),
        createField('side'),
        createField('price'),
        createField('timeInForce', 'Type'),
        createField('status'),
        {
            label: 'Last Update',
            value: (row: TActiveOrder) =>
                toDayjsWithTimezone(row.platformTime, timeZone).format(
                    EDateTimeFormats.DateTimeMilliseconds,
                ),
        },
        createField('remainingAmount', 'Size in base'),
        {
            label: 'Size in quote',
            value: (row: TActiveOrder) => Number(row.price) * Number(row.remainingAmount),
        },
        createField('originalAmount', 'Size init'),
        createField('gateName', 'Gate'),
        createField('virtualAccountId', 'VA ID'),
        createField('orderId', 'Order ID'),
    ];

    return { fields };

    function createField(key: string, label = capitalize(lowerCase(key))) {
        return {
            label,
            value: key,
        };
    }
}

const ONLY_CONTAINS_FILTER_PARAMS = {
    filterOptions: ['contains'],
};
const FLOATING_TEXT_PARAMS = {
    filter: EColumnFilterType.text,
    filterParams: ONLY_CONTAINS_FILTER_PARAMS,
    floatingFilter: true,
};

export type TTableActiveOrdersFilterModel = {
    gateName?: TAgGridTextFilter<EAgGridTextFilterType.contains>;
    accountName?: TAgGridTextFilter<EAgGridTextFilterType.contains>;
    instrumentName?: TAgGridTextFilter<EAgGridTextFilterType.contains>;
    side?: TAgGridRadioFilter<EOrderSide>;
    timeInForce?: TAgGridRadioFilter<EOrderTimeInForce>;
};

function useColumns(timeZone: TimeZone): ColDef<TActiveOrder>[] {
    return useMemo<ColDef<TActiveOrder>[]>(() => {
        const orderSideOptions = Object.values(EOrderSide).map((value) => ({
            label: value,
            value,
        }));

        const timeInForceOptions = Object.values(EOrderTimeInForce).map((value) => ({
            label: value,
            value,
        }));

        return (
            [
                {
                    headerName: 'Account',
                    field: 'accountName',
                    ...FLOATING_TEXT_PARAMS,
                },
                {
                    headerName: 'Instrument',
                    field: 'instrumentName',
                    ...FLOATING_TEXT_PARAMS,
                },

                {
                    headerName: 'Gate',
                    field: 'gateName',
                    ...FLOATING_TEXT_PARAMS,
                },
                {
                    headerName: 'Side',
                    field: 'side',
                    suppressMenu: true,
                    filter: createColumnRadioFilter<TActiveOrder, EOrderSide>({
                        getValue: (params) => params.data?.side,
                        withNone: true,
                        options: orderSideOptions,
                    }),
                    floatingFilter: true,
                    floatingFilterComponent: createColumnRadioFloatingFilter<
                        TActiveOrder,
                        EOrderSide
                    >({
                        withNone: true,
                        options: orderSideOptions,
                    }),
                    cellRendererSelector: (params) => ({
                        params: {
                            side: params.data?.side,
                        },
                        component: SideRenderer,
                    }),
                },
                {
                    headerName: 'Price',
                    field: 'price',
                },
                {
                    headerName: 'Type',
                    field: 'timeInForce',
                    filter: createColumnRadioFilter<TActiveOrder, EOrderTimeInForce>({
                        getValue: (params) => params.data?.timeInForce,
                        withNone: true,
                        options: timeInForceOptions,
                    }),
                    floatingFilter: true,
                    floatingFilterComponent: createColumnRadioFloatingFilter<
                        TActiveOrder,
                        EOrderTimeInForce
                    >({
                        withNone: true,
                        options: timeInForceOptions,
                    }),
                },
                {
                    headerName: 'Status',
                    field: 'status',
                },
                {
                    colId: 'lastUpdate',
                    headerName: 'Last Update',
                    valueGetter: isoGetter(),
                    cellRendererSelector: (params) => ({
                        params: {
                            platformTime: params.data?.platformTime,
                        },
                        component: AgeRenderer,
                    }),
                },
                {
                    headerName: 'Update time',
                    field: 'platformTime',
                    valueGetter: isoGetter(),
                    valueFormatter: dateFormatter(timeZone, EDateTimeFormats.DateTimeMilliseconds),
                },
                {
                    headerName: 'Size in base',
                    field: 'remainingAmount',
                },
                {
                    colId: 'sizeInQuote',
                    headerName: 'Size in quote',
                    valueGetter: (params) =>
                        params.data
                            ? Number(params.data.price) * Number(params.data.remainingAmount)
                            : undefined,
                    valueFormatter: (params) =>
                        isNil(params.value) ? '' : fixedLengthNumber(params.value, 10),
                },
                {
                    headerName: 'Size init',
                    field: 'originalAmount',
                },
                {
                    headerName: 'VA ID',
                    field: 'virtualAccountId',
                },
                {
                    headerName: 'Acc ID',
                    field: 'accountId',
                },
                {
                    headerName: 'Order ID',
                    field: 'orderId',
                },
            ] as ColDef<TActiveOrder>[]
        ).map((column): ColDef<TActiveOrder> => {
            column.filter = isString(column.field) ? column.filter : false;
            column.sortable = isString(column.field)
                ? ordersSortableFields.includes(column.field as keyof TActiveOrder)
                : false;

            return column;
        });
    }, [timeZone]);
}
