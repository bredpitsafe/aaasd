import { style } from '../../utils/css/style.css';
import { styleTableColsViewport } from './styles.ts';

export const cnPanelAutoSize = style({
    position: 'relative',
    width: '100%',
    padding: '10px',
});

styleTableColsViewport(cnPanelAutoSize, {
    minHeight: '24px!important',
});

export const cnPanelFixed = style({
    position: 'relative',
    height: '100%',
    width: '100%',
    padding: '10px',
});
