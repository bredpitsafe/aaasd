import { style } from '../../utils/css/style.css';
import {
    styleCompactTable,
    styleTable,
    styleTableContainer,
    styleTableTd,
    styleTableTdWithAppend,
} from '../Table/styles';

export const cnTable = style({
    flexGrow: 1,
});
styleCompactTable(cnTable);
export const cnSpinner = style({
    textAlign: 'center',
});

export const cnTSM = style({});
styleTableContainer(cnTSM, {
    background: 'none',
});
styleTableTd(cnTSM, {
    padding: 0,
    borderBottom: 'none',
});
styleTableTdWithAppend(cnTSM, {
    paddingLeft: '8px',
});

export const cnDashboard = style({ overflow: 'auto', maxHeight: '100%' });

styleTableContainer(cnDashboard, {
    background: 'none',
}),
    styleTable(cnDashboard, {
        borderSpacing: '4px',
        lineHeight: '1',
    }),
    styleTableTd(cnDashboard, {
        padding: 0,
        borderBottom: 'none',
    });
