import { style } from '@frontend/common/src/utils/css/style.css';

export const cnRoot = style({
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
});

export const cnQueryRow = style({
    flex: '1',
    display: 'flex',
});

export const cnEditor = style({
    flex: '1',
    alignSelf: 'stretch',
});

export const cnActions = style({
    padding: '8px',
});
