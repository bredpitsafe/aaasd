import { blue, cyan } from '@ant-design/colors';
import { cnNoPaddingCell } from '@frontend/common/src/components/AgTable/AgTable.css.ts';
import { specify } from '@frontend/common/src/utils/css/specify.ts';
import { style } from '@frontend/common/src/utils/css/style.css';

const PROPERTY_COLUMN_BACKGROUND = `rgb(from ${blue[1]} r g b / 50%)`;
const HAS_DIFF_CELL_BACKGROUND = `rgb(from ${cyan[1]} r g b / 50%)`;

export const cnGroup = style({
    fontWeight: 'bold',
    background: PROPERTY_COLUMN_BACKGROUND,
});

export const cnPinnedHeaderColumns = style({
    background: PROPERTY_COLUMN_BACKGROUND,
});

export const cnCellHasDiff = style(
    cnNoPaddingCell,
    specify({
        padding: '0 8px',
        background: HAS_DIFF_CELL_BACKGROUND,
    }),
);

export const cnPropertyHeaderContainer = style({
    display: 'flex',
    flexFlow: 'row',
    flexWrap: 'nowrap',
    alignItems: 'center',
    width: '100%',
});

export const cnPropertyHeaderName = style({
    minWidth: 0,
    flex: 1,
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
});
