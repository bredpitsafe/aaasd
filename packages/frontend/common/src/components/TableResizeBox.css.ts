import { grey } from '../utils/colors';
import { style } from '../utils/css/style.css';

export const cnHandles = style({
    pointerEvents: 'none',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
});

export const cnRoot = style({
    pointerEvents: 'auto',
    position: 'absolute',
    zIndex: 1,

    background: grey[0],
    opacity: 0.5,
    transition: 'all .1s',
    ':hover': {
        opacity: 1,
    },
});
export const cnX = style({
    cursor: 'ew-resize',
    top: 0,
    bottom: 0,
    right: 0,
    width: '4px',
});
export const cnY = style({
    cursor: 'ns-resize',
    bottom: 0,
    left: 0,
    right: 0,
    height: '4px',
});
