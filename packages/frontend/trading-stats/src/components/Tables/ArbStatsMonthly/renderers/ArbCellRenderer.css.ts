import { style } from '@frontend/common/src/utils/css/style.css';

export const cnArbCellRenderer = style({
    position: 'relative',
    height: '100%',
    zIndex: -1,
    padding: '1px calc(var(--ag-cell-horizontal-padding) - 1px);',
});
