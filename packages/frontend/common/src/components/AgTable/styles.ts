import type { StyleRule } from '@vanilla-extract/css';
import { globalStyle } from '@vanilla-extract/css';

export function styleTableRowHeight(parent: string, px: number) {
    globalStyle(`${parent}`, {
        vars: {
            '--ag-row-height': `${px}px`,
        },
    });
}

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

export function styleTableColsViewport(parent: string, style: StyleRule) {
    globalStyle(`${parent} .ag-root-wrapper .ag-body .ag-center-cols-viewport`, style);
}

export const AG_THEME_DARK = 'ag-theme-alpine-dark';
export const AG_THEME_LIGHT = 'ag-theme-alpine';
