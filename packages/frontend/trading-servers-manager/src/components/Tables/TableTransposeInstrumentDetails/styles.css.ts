import { blue } from '@ant-design/colors';
import { style } from '@frontend/common/src/utils/css/style.css';

const PROPERTY_COLUMN_BACKGROUND = `rgb(from ${blue[1]} r g b / 50%)`;

export const cnGroup = style({
    fontWeight: 'bold',
    background: PROPERTY_COLUMN_BACKGROUND,
});

export const cnPinnedHeaderColumns = style({
    background: PROPERTY_COLUMN_BACKGROUND,
});
