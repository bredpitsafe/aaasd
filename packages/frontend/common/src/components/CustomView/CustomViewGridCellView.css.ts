import { style } from '../../utils/css/style.css';

export const cnGridCell = style({
    border: '1px solid transparent',
    ':hover': {
        border: '1px dashed black',
    },
});
export const cnGridCellContent = style({
    display: 'flex',
    height: '100%',
    padding: '2px 4px',
    minHeight: '22px',
    overflow: 'hidden',
});
