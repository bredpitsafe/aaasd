import type { ColDef, EditableCallbackParams } from '@frontend/ag-grid';
import { EColumnFilterType } from '@frontend/ag-grid/src/types';
import { NumberEditor } from '@frontend/common/src/components/AgTable/editors/NumericEditor';
import { numberFormatter } from '@frontend/common/src/components/AgTable/formatters/number';
import { DefaultValueTooltip } from '@frontend/common/src/components/AgTable/tooltips/DefaultValueTooltip';
import type { TSocketName } from '@frontend/common/src/types/domain/sockets';
import { ESide } from '@frontend/common/src/types/domain/task.ts';
import { isNil, isNumber } from 'lodash-es';

import type { THerodotusTaskInstrumentView } from '../../types';
import { EHerodotusTaskRole, EHerodotusTaskStatus } from '../../types/domain';
import { cellClass } from '../../utils/cellClass';
import { numberFormatterWithCurrency } from '../TableHerodotusTasks/formatters/numberFormatterWithCurrency';
import { BestPriceRenderer } from './renderers/BestPriceRenderer';
import { InstrumentSideRenderer } from './renderers/InstrumentSideRenderer';

export function getInstrumentTypeColumn(): ColDef<THerodotusTaskInstrumentView> {
    return {
        field: 'side',
        sort: 'desc',
        cellRenderer: InstrumentSideRenderer,
    };
}

export function getInstrumentRoleColumn(editable: boolean): ColDef<THerodotusTaskInstrumentView> {
    return {
        field: 'role',
        headerName: 'Role',
        editable: (params) =>
            editable && isEditableField(params) && params.data?.taskType === ESide.BuySell,
        cellEditor: 'agSelectCellEditor',
        cellEditorPopup: true,
        cellEditorParams: {
            values: [EHerodotusTaskRole.Quote, EHerodotusTaskRole.Hedge],
        },
        cellClass,
    };
}

export function getStatusMessageColumn(): ColDef<THerodotusTaskInstrumentView> {
    return {
        field: 'statusMessage',
        headerName: 'Status',
        tooltipField: 'statusMessage',
        tooltipComponent: DefaultValueTooltip,
        filter: EColumnFilterType.text,
    };
}

export function getInstrumentFilledAmountColumn(): ColDef<THerodotusTaskInstrumentView> {
    return {
        field: 'filledAmountBase',
        headerName: 'Amount',
    };
}
export function getInstrumentTargetPriceColumn(): ColDef<THerodotusTaskInstrumentView> {
    return {
        field: 'targetPrice',
        headerName: 'Target',
        valueFormatter: numberFormatter('%.9g'),
    };
}
export function getInstrumentOrderPriceColumn(): ColDef<THerodotusTaskInstrumentView> {
    return {
        field: 'orderPrice',
        headerName: 'Order',
        valueFormatter: numberFormatter('%.6g'),
    };
}

export function getInstrumentAveragePriceColumn(): ColDef<THerodotusTaskInstrumentView> {
    return {
        field: 'avgPrice',
        headerName: 'Average',
        valueFormatter: numberFormatter('%.9g'),
    };
}

export function getInstrumentAveragePriceUsdColumn(): ColDef<THerodotusTaskInstrumentView> {
    return {
        field: 'avgPriceUsd',
        headerName: 'Avg. Price $',
        valueFormatter: numberFormatter('%.6g'),
    };
}

export function getInstrumentVolumeColumn(): ColDef<THerodotusTaskInstrumentView> {
    return {
        field: 'volume',
        headerName: 'Volume',
        valueFormatter: (params) =>
            numberFormatterWithCurrency(
                params.value,
                params.data?.computationCurrency,
                params.data?.isUSDComputationCurrency,
            ),
    };
}

export function getBestAskPriceColumn(
    socketName: TSocketName,
    onClick: (url: string, name: string) => void,
): ColDef<THerodotusTaskInstrumentView> {
    return {
        colId: 'bestAsk',
        headerName: 'Best Ask',
        cellRenderer: BestPriceRenderer,
        cellRendererParams: {
            side: ESide.Sell,
            socketName,
            onClick,
        },
    };
}

export function getBestBidPriceColumn(
    socketName: TSocketName,
    onClick: (url: string, name: string) => void,
): ColDef<THerodotusTaskInstrumentView> {
    return {
        colId: 'bestBid',
        headerName: 'Best Bid',
        cellRenderer: BestPriceRenderer,
        cellRendererParams: {
            side: ESide.Buy,
            socketName,
            onClick,
        },
    };
}

export function getBestPriceColumn(
    socketName: TSocketName,
    onClick: (url: string, name: string) => void,
): ColDef<THerodotusTaskInstrumentView> {
    return {
        colId: 'bestPrice',
        headerName: 'Best',
        cellRenderer: BestPriceRenderer,
        cellRendererParams: {
            socketName,
            onClick,
        },
        hide: true,
    };
}

export function getInstrumentAggressionColumn(
    editable = false,
): ColDef<THerodotusTaskInstrumentView> {
    return {
        field: 'aggressionOverride',
        headerName: 'Aggr',
        filter: EColumnFilterType.number,
        editable: (params) => editable && isEditableField(params),
        valueFormatter: (params) => (isNumber(params.value) ? `${params.value}%` : ''),
        cellEditor: NumberEditor,
        cellClass,
    };
}

function isEditableField(params: EditableCallbackParams<THerodotusTaskInstrumentView>): boolean {
    const status = params.data?.taskStatus;
    return (
        !isNil(status) &&
        [EHerodotusTaskStatus.started, EHerodotusTaskStatus.paused].includes(status)
    );
}
