import { specify } from '@frontend/common/src/utils/css/specify';
import { style } from '@frontend/common/src/utils/css/style.css';
import { globalStyle } from '@vanilla-extract/css';

export const cnContainer = style({ width: '186px' });
export const cnLayoutAddContainer = style({
    display: 'flex',
    flexWrap: 'nowrap',
    gap: '8px',
    marginBottom: '8px',
});
export const cnLayoutAddInput = style({});
globalStyle(`${cnLayoutAddInput}.ant-form-item`, {
    flexGrow: '1',
});

export const cnDivider = style(
    specify(
        {
            margin: '8px 0',
        },
        2,
    ),
);
