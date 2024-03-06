import { globalStyle, style } from '@vanilla-extract/css';

export const cnMessage = style({
    opacity: 0.75,
});
globalStyle(`${cnMessage}-notice-content`, {
    // @ts-ignore
    pointerEvents: 'none!important',
});
