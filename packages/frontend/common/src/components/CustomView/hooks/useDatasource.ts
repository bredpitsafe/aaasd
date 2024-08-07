import type { Milliseconds } from '@common/types';
import type { CellStyle, RowStyle } from '@frontend/ag-grid';
import { isEmpty, isNil } from 'lodash-es';
import { useMemo } from 'react';

import type { TBacktestingRunId } from '../../../types/domain/backtestings';
import type {
    TCompiledTableCell,
    TCompiledTableRow,
    TCustomViewCompiledTableContent,
} from '../../../utils/CustomView/parsers/defs';
import type { TIndicatorsMap } from '../utils';
import { applyCondition, buildCellText } from '../utils';
import type { TRow, TRowCell, TRowCells } from './defs';
import { getColumnName } from './utils';

export function useDatasource(
    functionCacheMap: Map<string, unknown>,
    compiledTable: TCustomViewCompiledTableContent,
    indicators: TIndicatorsMap,
    serverNow: Milliseconds,
    backtestingRunId: undefined | TBacktestingRunId,
): TRow[] {
    return useMemo(() => {
        const resultRows: TRow[] = [];

        fillDataRows(
            resultRows,
            functionCacheMap,
            compiledTable,
            indicators,
            serverNow,
            backtestingRunId,
            compiledTable.rows,
        );

        return resultRows;
    }, [functionCacheMap, compiledTable, indicators, serverNow, backtestingRunId]);
}

function cellsToRowData(
    functionCacheMap: Map<string, unknown>,
    compiledTable: TCustomViewCompiledTableContent,
    indicators: TIndicatorsMap,
    serverNow: Milliseconds,
    backtestingRunId: undefined | TBacktestingRunId,
    cells: TCompiledTableCell[],
): TRowCell[] {
    return cells.map(({ parameters, conditions }) => {
        const cellParameters = applyCondition(
            functionCacheMap,
            parameters,
            conditions,
            compiledTable.scope,
            indicators,
            serverNow,
            backtestingRunId,
        );

        return {
            cellStyle: isEmpty(cellParameters.style)
                ? undefined
                : (cellParameters.style as CellStyle),
            formattedValue: buildCellText(
                functionCacheMap,
                cellParameters,
                compiledTable.scope,
                indicators,
                serverNow,
                backtestingRunId,
            ),
            markerStyle: isEmpty(cellParameters?.mark?.style)
                ? undefined
                : cellParameters?.mark?.style,
            tooltip: isEmpty(cellParameters.tooltip) ? undefined : cellParameters.tooltip,
        };
    });
}

function fillDataRows(
    resultRows: TRow[],
    functionCacheMap: Map<string, unknown>,
    compiledTable: TCustomViewCompiledTableContent,
    indicators: TIndicatorsMap,
    serverNow: Milliseconds,
    backtestingRunId: undefined | TBacktestingRunId,
    rows?: TCompiledTableRow[],
    hierarchy: string[] = [],
): void {
    if (isNil(rows) || isEmpty(rows)) {
        return;
    }

    const offset = hierarchy.length;

    rows.forEach((row) => {
        const rowParameters = applyCondition(
            functionCacheMap,
            row.parameters,
            row.conditions,
            compiledTable.scope,
            indicators,
            serverNow,
            backtestingRunId,
        );

        const newRowData = cellsToRowData(
            functionCacheMap,
            compiledTable,
            indicators,
            serverNow,
            backtestingRunId,
            row.cells,
        );

        const newHierarchy = [...hierarchy, resultRows.length.toString()];

        if (
            rowParameters.style?.visibility === 'hidden' ||
            rowParameters.style?.display === 'none'
        ) {
            return;
        }

        resultRows.push({
            key: resultRows.length,
            hierarchy: newHierarchy,
            rowStyles: rowParameters.style as RowStyle | undefined,
            ...newRowData.reduce((acc, cell, index) => {
                acc[getColumnName(offset + index)] = cell;
                return acc;
            }, {} as TRowCells),
        });

        fillDataRows(
            resultRows,
            functionCacheMap,
            compiledTable,
            indicators,
            serverNow,
            backtestingRunId,
            row.rows,
            newHierarchy,
        );
    });
}
