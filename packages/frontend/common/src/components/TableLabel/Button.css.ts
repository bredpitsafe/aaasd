import { specify } from '../../utils/css/specify';
import { style } from '../../utils/css/style.css';

export const cnLabel = style({
    display: 'flex',
    justifyContent: 'stretch',
    alignItems: 'stretch',
    padding: '0!important',
});
export const cnButton = style(
    specify({
        background: 'transparent',
        fontSize: '12px',
        color: 'inherit',
        border: 'none',
    }),
);
