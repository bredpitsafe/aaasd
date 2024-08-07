import { style } from '@vanilla-extract/css';

export const cnWarningContainer = style({
    display: 'flex',
    flexFlow: 'column',
    width: '100%',
    height: '100%',
});

export const cnWarning = style({
    zIndex: 1001,
    flex: '0 0 auto',
});

export const cnContentContainer = style({ flex: '1 1 auto' });
