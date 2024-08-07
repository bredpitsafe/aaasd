import { style } from '@vanilla-extract/css';

export const cnTooltip = style({
    minWidth: 'min(90vw, 400px)',
});

export const cnTooltipContent = style({
    display: 'inline-flex',
    padding: '8px 16px',
    cursor: 'pointer',
    fontWeight: 'bold',
});

export const cnTooltipTitle = style({
    height: '100%',
});
