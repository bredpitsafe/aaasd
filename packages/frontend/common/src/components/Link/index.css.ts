import { blue } from '../../utils/colors';
import { style } from '../../utils/css/style.css';

export const cnLink = style({
    color: 'inherit',
    textDecoration: 'none',
    transition: 'color .3s',
    ':hover': {
        color: blue[5],
    },
    cursor: 'pointer',
});
