import { specify } from '@frontend/common/src/utils/css/specify';
import { style } from '@frontend/common/src/utils/css/style.css';

export const cnContainer = style({
    display: 'flex',
});

export const cnDialogContainer = style({
    position: 'relative',
});

export const cnDialog = style(
    specify({
        position: 'absolute',
        zIndex: 4,
        top: '0',
        width: '320px',
        height: '100vh',
    }),
);
