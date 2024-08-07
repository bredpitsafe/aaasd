import { style } from '@vanilla-extract/css';

import { yellow } from '../../../utils/colors';

export const cnFavoriteButton = style({
    color: yellow[4],
    ':hover': {
        color: `${yellow[5]}!important`,
        backgroundColor: `transparent!important`,
    },
});
