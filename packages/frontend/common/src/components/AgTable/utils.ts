import type { ICellRendererParams, IRowNode, ValueFormatterParams } from '@frontend/ag-grid';
import { AgGridCommon, Column, ColumnApi } from '@frontend/ag-grid';
import { isArray, isEmpty, isNil, isPlainObject } from 'lodash-es';
import { createElement } from 'react';
import { renderToString } from 'react-dom/server';

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

export function isGroupRow(node: IRowNode) {
    return node.group === true;
}
