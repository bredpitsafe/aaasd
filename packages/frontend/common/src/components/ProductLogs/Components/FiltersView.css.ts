import { green, red } from '../../../utils/colors';
import { specify } from '../../../utils/css/specify';
import { style } from '../../../utils/css/style.css';

export const cnForm = style({
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
});
export const cnRow = style({
    display: 'flex',
    gap: '8px',
});
export const cnCol50 = style({
    flexGrow: 1,
    width: '50%',
});
export const cnCol100 = style({
    flexGrow: 1,
    width: '100%',
});
export const cnItem = style({
    ...specify({
        marginBottom: '8px',
    }),
});
export const cnLastItem = style({
    ...specify({
        marginBottom: 0,
    }),
});
export const cnFilters = style({
    padding: '8px',
});
export const cnInclude = style({
    background: green[0],
});
export const cnExclude = style({
    background: red[0],
});
