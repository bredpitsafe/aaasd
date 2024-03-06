import { styleTableRowHeight } from '@frontend/common/src/components/AgTable/styles';
import { red } from '@frontend/common/src/utils/colors';
import { style } from '@frontend/common/src/utils/css/style.css';

export const cnProdHighlight = style({
    color: red[8],
});

export const cnRowHeight = style({});
styleTableRowHeight(cnRowHeight, 30);
export const cnDirtyIcon = style({
    color: red[6],
    marginRight: '4px',

    display: 'inline-block',
    position: 'relative',
    fontSize: '18px',
    width: '18px',
    height: '18px',
    verticalAlign: 'sub',
});
