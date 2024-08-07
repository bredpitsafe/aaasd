import { style } from '../../../utils/css/style.css';

export const cnRoot = style({
    display: 'grid',
    gridTemplateRows: '1fr min-content',
    height: '100%',
});

export const cnEmptyRoot = style({
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    height: '100%',
});

export const cnControls = style({
    justifyContent: 'flex-start',
});
