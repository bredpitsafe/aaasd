import { green, red } from '@frontend/common/src/utils/colors';
import { specify } from '@frontend/common/src/utils/css/specify';
import { style } from '@frontend/common/src/utils/css/style.css';

export const cnRoot = style({
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
});
export const cnLabels = style({
    marginBottom: '0px',
});
export const cnBidRow = style(
    specify({
        backgroundColor: green[0],
    }),
);
export const cnAskRow = style(
    specify({
        backgroundColor: red[0],
    }),
);
