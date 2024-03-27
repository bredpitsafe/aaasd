import { globalStyle, StyleRule } from '@vanilla-extract/css';
import { CSSObject } from 'cxs';

export function styleTableTd(parent: string, style: StyleRule) {
    globalStyle(`${parent}  .ant-table td.ant-table-cell`, style);
}

export function styleTableTh(parent: string, style: StyleRule) {
    globalStyle(`${parent} .ant-table th.ant-table-cell`, style);
}

export function styleTableTdWithAppend(parent: string, style: StyleRule) {
    globalStyle(`${parent} .ant-table td.ant-table-cell.ant-table-cell-with-append`, style);
}

export function styleExpandedTable(parent: string, style: StyleRule) {
    globalStyle(
        `${parent} .ant-table .ant-table-tbody .ant-table-wrapper:only-child .ant-table`,
        style,
    );
}

export function styleTableFontSize(parent: string, fontSize: string) {
    globalStyle(`${parent} & .ant-table-cell`, {
        fontSize,
    });
}

export function styleCompactTable(parent: string) {
    styleTableFontSize(parent, '13px');
    styleTableTh(parent, {
        padding: '4px',
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis',
    });
    styleTableTd(parent, {
        padding: '2px',
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis',
    });
    styleExpandedTable(parent, {
        margin: '0 0 0 20px',
    });
}

export function styleTable(parent: string, style: StyleRule) {
    globalStyle(`${parent}  .ant-table table`, style);
}

export function styleTableLegacy(style: CSSObject): CSSObject {
    return {
        ' .ant-table table': style,
    };
}

export function styleTableContainer(parent: string, style: StyleRule) {
    globalStyle(`${parent}  .ant-table`, style);
}
