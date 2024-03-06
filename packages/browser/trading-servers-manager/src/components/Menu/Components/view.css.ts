import { red } from '@ant-design/colors';
import { specify } from '@frontend/common/src/utils/css/specify';
import { style } from '@frontend/common/src/utils/css/style.css';
import { globalStyle } from '@vanilla-extract/css';

export const cnUpdating = style(
    specify({
        backgroundColor: red[0],
    }),
);

export const cnGridNoBorders = style({});
globalStyle(`${cnGridNoBorders} &.ag-root-wrapper`, {
    border: 'none',
});
