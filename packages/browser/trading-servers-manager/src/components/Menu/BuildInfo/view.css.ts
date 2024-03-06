import { grey } from '@frontend/common/src/utils/colors';
import { style } from '@frontend/common/src/utils/css/style.css';

export const cnNoWrap = style({
    whiteSpace: 'nowrap',
});
export const cnIcon = style({
    color: grey[3],
    display: 'inline-block',
    position: 'relative',
    width: '18px',
    height: '18px',
    borderRadius: '50%',
    fontSize: '18px',
    verticalAlign: 'sub',
    marginLeft: '4px',
});
