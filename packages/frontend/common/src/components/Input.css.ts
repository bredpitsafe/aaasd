import { style } from '../utils/css/style.css';

export const cnRoot = style({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 'auto',
    textOverflow: 'ellipsis',
});
export const cnContent = style({
    overflow: 'hidden',
    textOverflow: 'inherit',
    padding: '0 8px',
});
