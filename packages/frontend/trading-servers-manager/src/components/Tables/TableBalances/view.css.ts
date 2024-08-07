import { style } from '@frontend/common/src/utils/css/style.css';
import { globalStyle } from '@vanilla-extract/css';

export const cnBalanceEvenRow = style({
    background: '#f5f5f5',
});

export const cnBalanceTable = style({});

globalStyle(`${cnBalanceTable}`, {
    vars: {
        '--ag-background-color': `white`,
        '--ag-odd-row-background-color': 'white',
    },
});
