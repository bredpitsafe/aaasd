import { style } from '@frontend/common/src/utils/css/style.css';
import { globalStyle } from '@vanilla-extract/css';

export const badgeRoot = style({
    width: '100%',
});

globalStyle(`${badgeRoot} > button`, {
    width: '100%',
});
