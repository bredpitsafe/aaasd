import { withBorder } from '@frontend/common/src/components/mixins';
import { style } from '@frontend/common/src/utils/css/style.css';

export const cnRoot = style({
    display: 'flex',
    flexDirection: 'column',
    background: 'white',
    padding: '8px',
    ...withBorder('border'),
});
export const cnChart = style({
    display: 'flex',
    alignItems: 'baseline',
    fontSize: '10px',
});
export const cnName = style({
    padding: '2px',
    borderBottom: 'transparent 2px solid',
});
