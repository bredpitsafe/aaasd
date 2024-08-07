import { blue } from '../../utils/colors';
import { specify } from '../../utils/css/specify';
import { style } from '../../utils/css/style.css';

export const cnContainer = style({
    display: 'flex',
    flexFlow: 'column',
});
export const cnSpinner = style(
    specify({
        fontSize: '32px',
        willChange: 'transform',
        color: blue[5],
        margin: '0 auto',
    }),
);
export const cnDescription = style({
    color: blue[5],
});
