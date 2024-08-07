import { blue } from '@frontend/common/src/utils/colors';
import { specify } from '@frontend/common/src/utils/css/specify';
import { style } from '@frontend/common/src/utils/css/style.css';

export const cnLayout = style({
    position: 'relative',
    width: '100%',
    height: '100%',
    minWidth: '450px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-start',
});

export const cnLayoutContent = style({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '8px 50px',
    width: '100%',
    maxWidth: '1200px',
});

export const cnLayoutHeader = style(
    specify({
        background: blue[0],
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
    }),
);

export const cnLayoutHeaderContent = style({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    maxWidth: '1100px',
});
