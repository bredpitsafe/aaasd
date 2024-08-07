import { specify } from '../../utils/css/specify';
import { style } from '../../utils/css/style.css';

export const cnRoot = style({
    display: 'flex',
    flexDirection: 'column',
    height: 'calc(100% - 4px)',
});
export const cnFilter = style({
    ...specify({
        marginBottom: '8px',
    }),
});
export const cnTable = style({
    flexGrow: 1,
});
