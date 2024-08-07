import { style } from '@frontend/common/src/utils/css/style.css';

export const cnMenu = style({
    listStyleType: 'none',
    margin: 0,
    padding: 0,
    overflow: 'hidden',
    backgroundColor: '#333',
});

export const cnMenuItem = style({
    float: 'left',
});

export const cnMenuTitle = style({
    display: 'block',
    color: 'white',
    textAlign: 'center',
    padding: '14px 16px',
    textDecoration: 'none',
    ':hover': {
        backgroundColor: '#111',
    },
});

export const cnMenuTitleActive = style({
    backgroundColor: '#0088ff',
});
