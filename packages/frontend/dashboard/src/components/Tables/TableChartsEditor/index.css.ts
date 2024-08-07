import { style } from '@frontend/common/src/utils/css/style.css';

export const cnTable = style({
    flexGrow: 1,
});

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

export const cnEditorTable = style({
    flexGrow: 1,
    overflowY: 'auto',
});
