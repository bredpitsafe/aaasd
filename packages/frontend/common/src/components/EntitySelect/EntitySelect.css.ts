import { style, styleVariants } from '@vanilla-extract/css';

export const cnWrapper = style({
    position: 'relative',
});

export const cnFakeButton = style({
    position: 'relative',
    zIndex: 2,
    pointerEvents: 'none',
});

const cnSelectBase = style({
    position: 'absolute',
    top: 0,
    left: 0,
});

export const cnSelect = styleVariants({
    static: {
        minWidth: '180px',
    },
    idle: [
        cnSelectBase,
        {
            opacity: 0,
            width: '100%',
            zIndex: 0,
        },
    ],
    active: [
        cnSelectBase,
        {
            width: '220px',
            zIndex: 5,
        },
    ],
});
