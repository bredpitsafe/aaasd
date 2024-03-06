import { style } from '@frontend/common/src/utils/css/style.css';

export const cnContainer = style({
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    height: '100%',
});

export const cnHeader = style({
    flex: '0 0 auto',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    margin: '4px 8px 0 8px',
});

export const cnHeaderTitle = style({
    margin: '0 4px 0 0',
});

export const cnHeaderSelect = style({
    width: '200px',
});

export const cnChart = style({
    flex: '1 1 auto',
    minHeight: 0,
    overflow: 'hidden',
});

export const cnOverlay = style({
    alignItems: 'center',
    boxSizing: 'border-box',
    display: 'flex',
    height: '100%',
    justifyContent: 'center',
    margin: '8px',
});
