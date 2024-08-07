import { globalStyle, style } from '@vanilla-extract/css';

export const cnHiddenHeader = style({});

globalStyle(`${cnHiddenHeader} .ag-header`, {
    display: 'none',
});
