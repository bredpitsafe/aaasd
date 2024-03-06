import { globalStyle } from '@vanilla-extract/css';

export function styleTableRowHeight(parent: string, px: number) {
    globalStyle(`${parent}`, {
        vars: {
            '--ag-row-height': `${px}px`,
        },
    });
}
