import { style } from '@frontend/common/src/utils/css/style.css';
import { globalStyle } from '@vanilla-extract/css';

export const cnRoot = style({
    display: 'flex',
    height: '100%',
});
export const cnLayout = style({
    position: 'relative',
    flex: '1 1 auto',
});

globalStyle(`${cnLayout} .flexlayout__layout`, {
    fontSize: 'inherit',
});
