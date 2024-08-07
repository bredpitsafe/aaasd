import { style } from '../utils/css/style.css';

export const cnDropper = style({
    pointerEvents: 'none',
    border: 'dashed grey 4px',
    opacity: 0,
    transition: 'opacity ease-in-out .3s',
});

export const cnDropping = style({
    pointerEvents: 'all',
    opacity: 1,
});
