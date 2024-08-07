import type { CellClassParams, ColDef } from '@frontend/ag-grid';
import { FLOATING_TEXT_FILTER } from '@frontend/balance-monitor/src/components/Tables/utils.ts';
import { useMemo } from 'react';

import type { TCompiledTableParameters } from '../../../utils/CustomView/parsers/defs';
import { useFunction } from '../../../utils/React/useFunction';
import { TableCellRenderer } from '../renderer';
import type { TRow, TRowCell } from './defs';
import { getColumnName } from './utils';

export function useBuildColumnProps(tableParameters: TCompiledTableParameters): {
    columns: ColDef<TRow>[];
    autoGroupColumnDef: ColDef<TRow>;
} {
    const cellStyle = useFunction(({ value }: CellClassParams<TRow, TRowCell>) => {
        // When AgGrid receives null or undefined it doesn't reset cell style so we need empty object to force reset previous CSS from cell
        return value?.cellStyle ?? {};
    });

    const columns = useMemo(
        () =>
            new Array(
                Math.max(
                    0,
                    Math.max(
                        tableParameters.maxRowColumnsCount,
                        tableParameters.columns?.length ?? 0,
                    ) - 1,
                ),
            )
                .fill(0)
                .map((_, index) => {
                    const columnIndex = index + 1;
                    const column = tableParameters.columns?.[columnIndex];
                    const field = getColumnName(columnIndex);

                    return {
                        headerName: column?.text ?? '',
                        field,
                        valueFormatter: (params) => params.data?.[field]?.formattedValue ?? '',
                        filterValueGetter: (params) => params.data?.[field]?.formattedValue,
                        cellStyle,
                        cellRenderer: TableCellRenderer,
                        width: column?.width,
                        ...FLOATING_TEXT_FILTER,
                    } as ColDef<TRow>;
                }),
        [tableParameters, cellStyle],
    );

    const groupHeaderName = tableParameters.columns?.[0]?.text ?? '';

    const autoGroupColumnDef = useMemo<ColDef<TRow>>(() => {
        const field = getColumnName(0);
        return {
            headerName: groupHeaderName,
            field,
            valueFormatter: (params) => params.data?.[field]?.formattedValue ?? '',
            filterValueGetter: (params) => params.data?.[field]?.formattedValue,
            cellStyle,
            cellRendererParams: {
                suppressCount: true,
                innerRenderer: TableCellRenderer,
            },
            ...FLOATING_TEXT_FILTER,
        };
    }, [groupHeaderName, cellStyle]);

    return { columns, autoGroupColumnDef };
}
