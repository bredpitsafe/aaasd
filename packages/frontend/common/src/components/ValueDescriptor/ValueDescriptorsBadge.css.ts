import { keyframes, style } from '../../utils/css/style.css';

export const cnAlert = style({
    position: 'absolute',
    zIndex: 1,
    top: '4px',
    right: '4px',
    padding: '4px 8px',
    transition: 'all 0.3s',
});

const hide = keyframes({
    '0%': { opacity: 1 },
    '99%': { opacity: 0 },
    '100%': { display: 'none' },
});

export const cnAlertSuccess = style({
    animationName: hide,
    animationDelay: '1s',
    animationDuration: '0.3s',
    animationFillMode: 'forwards',
});
