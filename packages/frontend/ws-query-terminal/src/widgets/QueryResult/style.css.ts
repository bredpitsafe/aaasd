import { style } from '@frontend/common/src/utils/css/style.css';

export const cnRoot = style({
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
});

export const cnEditor = style({
    flex: '1',
});

export const cnLoading = style({
    flex: '1',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
});

export const cnActions = style({
    padding: '8px',
});
