import { styleCompactTable } from '@frontend/common/src/components/Table/styles';
import { style } from '@frontend/common/src/utils/css/style.css';

export const cnTable = style({
    flexGrow: 1,
});

styleCompactTable(cnTable);

export const cnInputCell = style({
    padding: 0,
    selectors: {
        '&:focus-within:not(#\\9)': {
            borderColor: 'transparent',
        },
    },
});

export const cnInput = style({
    height: '100%',
});

export const cnTextInput = style(cnInput, {
    width: '100%',
});
