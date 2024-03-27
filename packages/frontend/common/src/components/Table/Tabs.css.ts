import { globalStyle, StyleRule } from '@vanilla-extract/css';

export function styleTableHeaderRow(parent: string, style: StyleRule) {
    globalStyle(
        `${parent} .ag-root-wrapper .ag-header-row:not(.ag-header-row-column-filter)`,
        style,
    );
}

export function styleTableHeaderRowFilter(parent: string, style: StyleRule) {
    globalStyle(`${parent} .ag-root-wrapper .ag-header-row.ag-header-row-column-filter`, style);
}

export function styleTableHeaderFilterInput(parent: string, style: StyleRule) {
    globalStyle(
        `${parent} .ag-root-wrapper .ag-header-row.ag-header-row-column-filter .ag-input-field-input`,
        style,
    );
}
