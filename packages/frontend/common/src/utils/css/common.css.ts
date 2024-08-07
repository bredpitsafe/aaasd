import { style } from './style.css';

export const cnDisplayNone = style({
    display: 'none',
});

export const cnRelative = style({
    position: 'relative',
});

export const cnRow = style({
    display: 'flex',
});

export const cnCol = style({
    display: 'flex',
    flexDirection: 'column',
});

export const cnFit = style({
    width: '100%',
    height: '100%',
});

export const cnAbsoluteFit = style({
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
});
