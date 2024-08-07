import { style } from '../utils/css/style.css';

export const cnButton = style({
    border: 'none',
    background: 'none',
    ':hover': {
        color: 'rgba(0, 0, 0, 0.88) !important',
        backgroundColor: 'rgba(0, 0, 0, 0.06)',
    },
    ':active': {
        color: 'rgba(0, 0, 0, 0.88) !important',
        backgroundColor: 'rgba(0, 0, 0, 0.15)',
    },
});
