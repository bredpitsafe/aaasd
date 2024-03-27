import { style, styleVariants } from '@vanilla-extract/css';

import { blue, orange } from '../../utils/colors';

export const cnOption = style({
    display: 'grid',
    alignItems: 'center',
    columnGap: '8px',
    gridTemplateColumns: 'min-content 1fr min-content',
});

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
            width: '200px',
            zIndex: 3,
        },
    ],
});

export const cnStageIcon = styleVariants({
    prod: {
        color: orange[5],
    },
    dev: {
        color: blue[5],
    },
});

export const cnFavoriteButton = style({
    margin: '-1px',
});
