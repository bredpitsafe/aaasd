import { red, yellow } from '../../../utils/colors';
import { specify } from '../../../utils/css/specify';
import { style } from '../../../utils/css/style.css';
import { styleCompactTable } from '../../Table/styles';

export const cnRoot = style({
    display: 'flex',
    flexDirection: 'column',
});
export const cnTable = style({
    flexGrow: 1,
});
styleCompactTable(cnTable);

export const cnWarningRow = style(
    specify({
        background: yellow[0],
    }),
);
export const cnErrorRow = style(
    specify({
        background: red[0],
    }),
);
