import { blue } from '../../utils/colors';
import { style } from '../../utils/css/style.css';
import { LEFT_EDITOR_BORDER_WIDTH } from './def';

export const cnConfigEditor = style({
    display: 'flex',
    flexDirection: 'column',
});
export const cnEditor = style({
    flexGrow: 1,
    borderLeft: `transparent ${LEFT_EDITOR_BORDER_WIDTH}px solid`,
    transition: 'border .15s',
});
export const cnWithChanges = style({
    borderLeftColor: blue[3],
});
