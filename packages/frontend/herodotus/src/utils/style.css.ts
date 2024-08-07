import { styleTableRowHeight } from '@frontend/common/src/components/AgTable/styles';
import { blue } from '@frontend/common/src/utils/colors';
import { style } from '@frontend/common/src/utils/css/style.css';

export const cnRoot = style({
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
});

export const cnColorizedDetailsRow = style({
    backgroundColor: blue[0],
});

export const cnDisabledRow = style({
    pointerEvents: 'none',
    filter: 'grayscale(50%)',
    opacity: '0.5',
});

export const cnIncreasedRowHeight = style({});
styleTableRowHeight(cnIncreasedRowHeight, 40);

export const cnEditable = style({
    cursor: 'pointer',
});
