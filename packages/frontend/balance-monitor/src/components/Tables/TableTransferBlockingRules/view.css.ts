import { red } from '@ant-design/colors';
import { specify } from '@frontend/common/src/utils/css/specify';
import { style } from '@frontend/common/src/utils/css/style.css';

export const cnActiveAlertRules = style(
    specify({
        backgroundColor: red[1],
    }),
);
