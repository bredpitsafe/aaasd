import { red } from '@frontend/common/src/utils/colors';
import { style } from '@frontend/common/src/utils/css/style.css';
import { globalStyle } from '@vanilla-extract/css';

export const cnPanel = style({
    color: red.primary,
});
globalStyle(`${cnPanel} > .ant-collapse-content > .ant-collapse-content-box`, {
    padding: '0',
});
