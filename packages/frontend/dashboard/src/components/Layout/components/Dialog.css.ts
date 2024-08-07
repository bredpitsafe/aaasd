import { style } from '@frontend/common/src/utils/css/style.css';
import { globalStyle } from '@vanilla-extract/css';
export const cnDialog = style({
    background: 'white',
});
export const cnCard = style({
    overflow: 'hidden',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
});
globalStyle(`${cnCard}  > .ant-card-body`, { overflow: 'auto' });

export const cnClose = style({
    position: 'absolute',
    top: '10px',
    right: '10px',
});
