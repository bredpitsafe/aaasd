import { blue, red } from '@ant-design/colors';
import { cnNoPaddingCell } from '@frontend/common/src/components/AgTable/AgTable.css.ts';
import { specify } from '@frontend/common/src/utils/css/specify';
import { style } from '@frontend/common/src/utils/css/style.css';

const PROPERTY_COLUMN_BACKGROUND = `rgb(from ${blue[1]} r g b / 50%)`;
const ERROR_CELL_BACKGROUND = `rgb(from ${red[1]} r g b / 50%)`;

export const cnGroup = style({
    fontWeight: 'bold',
    background: PROPERTY_COLUMN_BACKGROUND,
});

export const cnPinnedHeaderColumns = style({
    background: PROPERTY_COLUMN_BACKGROUND,
});

export const cnNonEditableCell = style(cnNoPaddingCell, {
    background: '#f0f0f0',
    cursor: 'not-allowed',
});

export const cnCellError = style(
    cnNoPaddingCell,
    specify({
        padding: '0 8px',
        background: ERROR_CELL_BACKGROUND,
    }),
);

export const cnOverrideButtonContainer = style({
    flex: 1,
    justifyContent: 'center',
    display: 'flex',
});
