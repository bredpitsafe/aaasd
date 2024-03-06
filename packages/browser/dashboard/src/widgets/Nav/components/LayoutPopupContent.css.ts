import { specify } from '@frontend/common/src/utils/css/specify';
import { style } from '@frontend/common/src/utils/css/style.css';
import { globalStyle } from '@vanilla-extract/css';

export const cnContainer = style({ width: '186px' });
export const cnLayoutAddContainer = style({
    display: 'flex',
    flexWrap: 'nowrap',
});
export const cnLayoutAddInput = style({});
globalStyle(`${cnLayoutAddInput}.ant-form-item`, {
    flex: '1 1 auto',
    marginRight: '8px',
    marginBottom: '8px',
});

export const cnLayoutAddButton = style({});
globalStyle(`${cnLayoutAddInput}.ant-form-item`, {
    flex: '0 0 auto',
    marginBottom: '8px',
});

export const cnDivider = style(
    specify(
        {
            margin: '8px 0',
        },
        2,
    ),
);
