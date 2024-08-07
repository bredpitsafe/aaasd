import { style, styleVariants } from '@vanilla-extract/css';

import { blue, orange } from '../../utils/colors';

export const cnOption = style({
    display: 'grid',
    alignItems: 'center',
    columnGap: '8px',
    gridTemplateColumns: 'min-content 1fr min-content',
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
