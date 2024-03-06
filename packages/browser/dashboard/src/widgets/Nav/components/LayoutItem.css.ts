import { blue } from '@frontend/common/src/utils/colors';
import { specify } from '@frontend/common/src/utils/css/specify';
import { style } from '@frontend/common/src/utils/css/style.css';

export const cnLayoutItem = style(
    specify(
        {
            padding: '0 8px',
            cursor: 'pointer',
        },
        2,
    ),
);
export const cnLayoutItemActive = style(
    specify(
        {
            backgroundColor: blue[3],
            cursor: 'default',
        },
        2,
    ),
);
export const cnLayoutItemLabel = style({
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
});
export const cnLayoutItemDeleteBtn = style({
    flex: '0 0 auto',
    cursor: 'pointer',
});
