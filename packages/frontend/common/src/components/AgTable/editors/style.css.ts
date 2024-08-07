import { orange, red } from '@ant-design/colors';

import { specify } from '../../../utils/css/specify';
import { style } from '../../../utils/css/style.css';

export const cnInput = style(
    specify({
        width: '100%',
        position: 'absolute',
        top: '50%',
        transform: 'translateY(-50%)',
    }),
);

export const cnWarnColorIcon = style({
    color: orange[6],
});

export const cnErrorColorIcon = style({
    color: red[6],
});

export const cnReadOnlyEditor = style({
    display: 'table',
    padding: '0 4px 4px',
    position: 'relative',
    maxWidth: '400px',
    userSelect: 'text',
    fontSize: 'calc(var(--ag-font-size) + 1px)',
    backgroundColor: 'var(--ag-background-color)',
});
