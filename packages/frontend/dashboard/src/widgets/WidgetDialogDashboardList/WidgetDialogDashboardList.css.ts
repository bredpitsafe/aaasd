import { grey } from '@frontend/common/src/utils/colors';
import { style } from '@frontend/common/src/utils/css/style.css';

export const cnResizeHandle = style({
    position: 'absolute',
    zIndex: 1,
    top: '0px',
    right: '-2px',
    width: '4px',
    height: '100%',
    background: grey[0],
    cursor: 'col-resize',
    ':hover': {
        background: grey[2],
    },
});
