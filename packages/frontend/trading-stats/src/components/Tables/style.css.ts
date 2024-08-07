import { blue } from '@frontend/common/src/utils/colors.ts';
import { style } from '@frontend/common/src/utils/css/style.css';

export const cnBold = style({
    fontWeight: 'bold',
});

export const cnTableContainer = style({
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    height: '100%',
});

export const cnHeaderRow = style({
    fontWeight: 'bold',
});

export const cnRowLevel0 = style({
    backgroundColor: blue[0],
});
export const cnRowLevel1 = style({
    backgroundColor: '#eeeeee',
});
export const cnRowFooter = style({
    borderTop: `1px solid`,
});

export const cnColumnTotal = style({
    borderLeft: `1px solid !important`,
    borderRight: `1px solid !important`,
});
