import type { CellStyle, RowStyle } from '@frontend/ag-grid/src/ag-grid-community.ts';
import type { Properties } from 'csstype';

export type TRowCell = {
    cellStyle?: CellStyle;
    markerStyle?: Properties;
    formattedValue: string;
    tooltip?: string;
};

export type TCellKey = `column_${number}`;
export type TRowCells = Record<TCellKey, TRowCell>;

export type TRow = {
    key: string | number;
    hierarchy: string[];
    rowStyles?: RowStyle;
} & TRowCells;
