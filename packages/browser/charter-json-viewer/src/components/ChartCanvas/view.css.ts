import { style } from '@frontend/common/src/utils/css/style.css';
import { globalStyle } from '@vanilla-extract/css';

export const cnRoot = style({
    position: 'relative',
    minWidth: '1px',
    minHeight: '1px',
    userSelect: 'none',
});

globalStyle(`${cnRoot} & canvas`, {
    position: 'absolute',
    top: '0',
    left: '0',
});
