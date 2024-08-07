import type {
    AgGridCommon,
    Column,
    ColumnApi,
    GridApi,
    ICellRendererParams,
    IRowNode,
    RowModelType,
    ValueFormatterParams,
} from '@frontend/ag-grid';
import { isArray, isEmpty, isNil, isPlainObject } from 'lodash-es';
import { createElement } from 'react';
import { renderToString } from 'react-dom/server';
import type { Observable } from 'rxjs';
import { fromEvent } from 'rxjs';
import type { JQueryStyleEventEmitter } from 'rxjs/internal/observable/fromEvent';

import type { TTableId } from '../../modules/clientTableFilters/data.ts';

export type TParams<TData> = AgGridCommon<TData, unknown> & {
    value: unknown;
    node?: IRowNode<TData> | null;
    column?: Column | null;
};

export function getCellValue<TData>(params: TParams<TData>): string | undefined {
    if (isNil(params.node) || isNil(params.column)) {
        return undefined;
    }

    const colDef = params.column.getColDef();

    if (typeof colDef.valueFormatter === 'function') {
        const formatterParams: ValueFormatterParams<TData, unknown> = {
            value: params.value,
            node: params.node,
            data: params.node.data,
            column: params.column,
            colDef: colDef,
            api: params.api,
            columnApi: params.columnApi,
            context: params.context,
        };

        return colDef.valueFormatter(formatterParams);
    }

    const tempElement = document.createElement('div');

    if (typeof colDef.cellRendererSelector === 'function') {
        const cellRendererParams = {
            rowIndex: params.node.rowIndex,
            eGridCell: tempElement,
            eParentOfValue: tempElement,
            valueFormatted: undefined,
            value: params.value,
            node: params.node,
            data: params.node.data,
            column: params.column,
            colDef: colDef,
            api: params.api,
            columnApi: params.columnApi,
            context: params.context,
            registerRowDragger: () => undefined,
        } as ICellRendererParams<unknown, TData>;

        const result = colDef.cellRendererSelector(cellRendererParams);

        if (isNil(result?.component)) {
            return (params.value as object)?.toString();
        }

        try {
            const tempElement = document.createElement('div');
            tempElement.innerHTML = renderToString(
                createElement(result!.component, result?.params ?? params),
            );
            const elementText = tempElement.textContent;

            if (!isEmpty(elementText)) {
                return elementText ?? undefined;
            }
        } catch (e) {}
    }

    if (isPlainObject(params.value)) {
        // Skip empty objects as they're useless in the resulting string
        if (isEmpty(params.value)) {
            return undefined;
        }
        return JSON.stringify(params.value);
    }

    return (params.value as object)?.toString();
}

export function applyAutoSize(columnApi: ColumnApi) {
    const cols = columnApi.getColumns()?.filter((c) => c.getColDef().suppressAutoSize !== true);

    if (isArray(cols) && cols.length > 0) {
        columnApi.autoSizeColumns(cols);
    }
}

export function applyAutoSizeDisplayColumns(columnApi: ColumnApi) {
    const columns = columnApi
        .getAllDisplayedColumns()
        ?.filter((c) => c.getColDef().suppressAutoSize !== true);

    if (isArray(columns) && columns.length > 0) {
        columnApi.autoSizeColumns(columns);
    }
}

export function isGroupRow(node: IRowNode) {
    return node.group === true;
}

export function fromAgGridEvent<RecordType, T>(
    target: GridApi<RecordType>,
    eventName: string,
): Observable<T> {
    return fromEvent(target as unknown as JQueryStyleEventEmitter<never, T>, eventName);
}

export function getRowModelType<RecordType>(gridApi: GridApi<RecordType>): RowModelType {
    return gridApi.getModel()?.getType() ?? 'clientSide';
}

export function isClientRowModel<RecordType>(gridApi: GridApi<RecordType>) {
    return getRowModelType(gridApi) === 'clientSide';
}

export function hasFirstDataRenderedEvent<RecordType>(gridApi: GridApi<RecordType>) {
    const type = getRowModelType(gridApi);
    return type === 'viewport' || type === 'clientSide' || type === 'serverSide';
}

export function getGridId<RecordType>(gridApi: GridApi<RecordType> | undefined): TTableId {
    return (gridApi?.getGridId() as TTableId) ?? ('NO_ID' as TTableId);
}

export function isUserColumnAction(source: string): boolean {
    return source?.toUpperCase().startsWith('UICOLUMN') ?? false;
}
