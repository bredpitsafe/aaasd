import { NumberEditor } from '@frontend/common/src/components/AgTable/editors/NumericEditor';
import { dateFormatter } from '@frontend/common/src/components/AgTable/formatters/date';
import {
    maxPrecisionNumberFormatter,
    numberFormatter,
} from '@frontend/common/src/components/AgTable/formatters/number';
import { EColumnFilterType } from '@frontend/common/src/components/AgTable/types';
import { ETableIds } from '@frontend/common/src/modules/clientTableFilters/data';
import { TimeZone } from '@frontend/common/src/types/time';
import type { ColDef, EditableCallbackParams } from 'ag-grid-community';
import { isNil, isNumber } from 'lodash-es';

import { THerodotusTaskView } from '../../types';
import { EHerodotusTaskStatus, EHerodotusTaskType } from '../../types/domain';
import { cellClass } from '../../utils/cellClass';
import { numberFormatterWithCurrency } from './formatters/numberFormatterWithCurrency';
import { progressFormatter } from './formatters/progressFormatter';
import { volumeFormatter } from './formatters/volumeFormatter';
import { AmountUsdRenderer } from './renderers/AmountUsdRenderer';
import { TaskStatusRenderer } from './renderers/TaskStatusRenderer';
import { TaskTypeRenderer } from './renderers/TaskTypeRenderer';
import type { TTableHerodotusTasksProps } from './view';

export const DEFAULT_COL_DEF: ColDef<THerodotusTaskView> = {
    sortable: true,
    filter: false,
};
function getIdColumn(): ColDef<THerodotusTaskView> {
    return {
        field: 'taskId',
        headerName: 'Id',
        filter: EColumnFilterType.number,
        floatingFilter: true,
        cellRenderer: 'agGroupCellRenderer',
        sort: 'desc',
    };
}

function getTypeColumn(): ColDef<THerodotusTaskView> {
    return {
        field: 'taskType',
        headerName: 'Type',
        enableRowGroup: true,
        cellRenderer: TaskTypeRenderer,
        filter: EColumnFilterType.set,
        floatingFilter: true,
    };
}

function getTargetAmountColumn(editable = false): ColDef<THerodotusTaskView> {
    return {
        field: 'amountView',
        headerName: 'Amount',
        editable: (params) => editable && isEditableField(params),
        cellClass,

        valueFormatter: maxPrecisionNumberFormatter(),
        cellEditor: NumberEditor,
    };
}

function getTargetUsdAmountColumn(): ColDef<THerodotusTaskView> {
    return {
        colId: 'amountUsd',
        headerName: 'Amount, USD',
        cellRenderer: AmountUsdRenderer,
    };
}

function getAssetColumn(): ColDef<THerodotusTaskView> {
    return {
        field: 'asset',
        headerName: 'Asset',
        enableRowGroup: true,
        filter: EColumnFilterType.text,
        floatingFilter: true,
    };
}

function getStatusColumn(
    onStart: (id: THerodotusTaskView['taskId']) => void,
    onPaused: (id: THerodotusTaskView['taskId']) => void,
    onSave: (id: THerodotusTaskView['taskId']) => void,
    onReset: (id: THerodotusTaskView['taskId']) => void,
): ColDef<THerodotusTaskView> {
    return {
        colId: 'status',
        field: 'status',
        headerName: 'Status',
        cellRenderer: TaskStatusRenderer,
        cellRendererParams: {
            onStart,
            onPaused,
            onSave,
            onReset,
        },
        equals: () => false,
        enableRowGroup: true,
        filter: EColumnFilterType.set,
        filterValueGetter: (params) => params.data?.status.toLocaleUpperCase(),
        floatingFilter: true,
    };
}

function getProgressColumn(): ColDef<THerodotusTaskView> {
    return {
        field: 'progress',
        headerName: 'Progress',
        valueFormatter: progressFormatter,
    };
}

function getAggressionColumn(editable = false): ColDef<THerodotusTaskView> {
    return {
        field: 'aggression',
        headerName: 'Aggr',

        editable: (params) => editable && isEditableField(params),
        valueFormatter: (params) => (isNumber(params.value) ? `${params.value}%` : ''),
        cellEditor: NumberEditor,
        cellClass,
    };
}

function getPriceLimitColumn(editable = false): ColDef<THerodotusTaskView> {
    return {
        field: 'priceLimitView',
        headerName: 'Price Limit',
        valueFormatter: (params) =>
            numberFormatterWithCurrency(
                params.value,
                params.data?.computationCurrency,
                params.data?.isUSDComputationCurrency,
            ),
        editable: (params) =>
            editable &&
            isEditableField(params) &&
            !isNil(params.data?.taskType) &&
            params.data?.taskType !== EHerodotusTaskType.BuySell,

        cellEditor: NumberEditor,
        cellClass,
    };
}

function getMaxPremiumColumn(editable = false): ColDef<THerodotusTaskView> {
    return {
        field: 'maxPremium',
        headerName: 'Max Premium',
        valueFormatter: (params) => {
            return !isNil(params.value) ? `${params.value}%` : '';
        },
        editable: (params) =>
            editable &&
            isEditableField(params) &&
            params.data?.taskType === EHerodotusTaskType.BuySell,

        cellEditor: NumberEditor,
        cellClass,
    };
}

function getAveragePriceColumn(): ColDef<THerodotusTaskView> {
    return {
        field: 'avgPriceView',
        headerName: 'Avg. Price',
        valueFormatter: (params) =>
            numberFormatterWithCurrency(
                params.value,
                params.data?.computationCurrency,
                params.data?.isUSDComputationCurrency,
            ),
    };
}
function getFilledAmountColumn(): ColDef<THerodotusTaskView> {
    return {
        colId: 'volume',
        headerName: 'Volume',
        valueFormatter: volumeFormatter,
    };
}

function getRealizedPremiumColumn(): ColDef<THerodotusTaskView> {
    return {
        field: 'realizedPremium',
        headerName: 'Realized Premium',
        valueFormatter: numberFormatter('%.4g%%'),
    };
}

function getOrderSizeColumn(editable = false): ColDef<THerodotusTaskView> {
    return {
        field: 'orderSize',
        headerName: 'Order Size',

        editable: (params) => isEditableField(params) && editable,
        valueFormatter: maxPrecisionNumberFormatter(),
        cellEditor: NumberEditor,
        cellClass,
    };
}

function getTimeColumn(
    headerName: string,
    field: ColDef<THerodotusTaskView>['field'],
    timeZone: TimeZone,
): ColDef<THerodotusTaskView> {
    return {
        field,
        headerName,
        valueFormatter: dateFormatter(timeZone),
    };
}

function getUserColumn(): ColDef<THerodotusTaskView> {
    return {
        field: 'user',
        headerName: 'User',
        filter: EColumnFilterType.text,
        floatingFilter: true,
    };
}

function isEditableField(params: EditableCallbackParams<THerodotusTaskView>): boolean {
    return (
        !isNil(params.data) &&
        [EHerodotusTaskStatus.started, EHerodotusTaskStatus.paused].includes(params.data.status)
    );
}

export const getColumns = (
    props: Pick<
        TTableHerodotusTasksProps,
        'tableId' | 'onStart' | 'onPause' | 'timeZone' | 'onSave' | 'onReset'
    >,
): ColDef<THerodotusTaskView>[] => {
    const activeColumns: ColDef<THerodotusTaskView>[] = [
        getIdColumn(),
        getStatusColumn(props.onStart, props.onPause, props.onSave, props.onReset),
        getTypeColumn(),
        getTargetAmountColumn(true),
        getTargetUsdAmountColumn(),
        getAssetColumn(),
        getProgressColumn(),
        getAveragePriceColumn(),
        getRealizedPremiumColumn(),
        getFilledAmountColumn(),
        getAggressionColumn(true) as ColDef<THerodotusTaskView>,
        getOrderSizeColumn(true),
        getPriceLimitColumn(true),
        getMaxPremiumColumn(true),
        getUserColumn(),
        getTimeColumn('Updated', 'lastChangedTs', props.timeZone),
    ];

    const archivedColumns: ColDef<THerodotusTaskView>[] = [
        getIdColumn(),
        getTypeColumn(),
        getTargetAmountColumn(),
        getTargetUsdAmountColumn(),
        getAssetColumn(),
        getProgressColumn(),
        getAveragePriceColumn(),
        getRealizedPremiumColumn(),
        getFilledAmountColumn(),
        getAggressionColumn() as ColDef<THerodotusTaskView>,
        getPriceLimitColumn(),
        getMaxPremiumColumn(),
        getUserColumn(),
        getTimeColumn('Started', 'createdTs', props.timeZone),
        getTimeColumn('Finished', 'finishedTs', props.timeZone),
    ];

    return props.tableId === ETableIds.ActiveTasks ? activeColumns : archivedColumns;
};
