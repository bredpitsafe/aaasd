import { style } from '@frontend/common/src/utils/css/style.css';

export const cnTooltipTitle = style({
    display: 'flex',
    flexDirection: 'column',
    width: 'fit-content',
    gap: '8px',
});

export const cnTooltipText = style({
    margin: '6px 0',
});

export const cnTooltipValue = style({
    cursor: 'pointer',
    textDecoration: 'underline',
});
