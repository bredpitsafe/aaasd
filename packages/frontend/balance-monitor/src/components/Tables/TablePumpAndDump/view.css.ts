import { green, red } from '@ant-design/colors';
import { specify } from '@frontend/common/src/utils/css/specify';
import { style } from '@frontend/common/src/utils/css/style.css';

export const cnRowStyles = {
    positive: style(
        specify({
            backgroundColor: green[1],
        }),
    ),
    negative: style(
        specify({
            backgroundColor: red[1],
        }),
    ),
};

export const cnPositiveChange = style({
    color: green[6],
    marginRight: '2px',
});

export const cnNegativeChange = style({
    color: red[6],
    marginRight: '2px',
});
