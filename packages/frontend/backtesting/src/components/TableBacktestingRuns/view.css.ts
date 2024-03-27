import { blue, green, red } from '@ant-design/colors';
import { specify } from '@frontend/common/src/utils/css/specify';
import { style } from '@frontend/common/src/utils/css/style.css';

export const cns = {
    root: style({
        display: 'flex',
    }),
};

export const cnSucceedRow = style(
    specify({
        backgroundColor: green[0],
    }),
);

export const cnRunningRow = style(
    specify({
        backgroundColor: blue[0],
    }),
);

export const cnFailedRow = style(
    specify({
        backgroundColor: red[0],
    }),
);
