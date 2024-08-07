import { style } from '../../../utils/css/style.css';

export const cnTooltip = style({
    display: 'table',
    padding: '4px 8px 4px 8px',
    position: 'relative',
    maxWidth: '400px',
    userSelect: 'text',
    fontSize: 'calc(var(--ag-font-size) + 1px)',
    backgroundColor: 'white',
    border: '1px solid black',
});
