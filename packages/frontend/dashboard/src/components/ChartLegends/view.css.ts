import { style } from '@frontend/common/src/utils/css/style.css';

export const cnRoot = style({
    overflow: 'hidden',
    display: 'flex',
});
export const cnLegends = style({
    display: 'flex',
    flexGrow: 1,
    flexBasis: '0',
    minWidth: 0,
    overflow: 'hidden',
});
export const cnLegendsViewModeAll = style({
    flexWrap: 'wrap',
});
export const cnLegendsViewModeScroll = style({
    overflow: 'auto',
    scrollbarWidth: 'none',
    '::-webkit-scrollbar': {
        display: 'none',
    },
});
export const cnLegend = style({
    cursor: 'pointer',
    position: 'relative',
    display: 'inline-flex',
    padding: '4px 8px',
    marginRight: '8px',
    userSelect: 'none',
});
export const cnLegendInactive = style({
    opacity: 0.5,
    filter: 'grayscale(0.5)',
});
export const cnLine = style({
    position: 'absolute',
    left: '0px',
    right: '0px',
    bottom: '0px',
    height: '2px',
});
export const cnTextLine = style({
    display: 'flex',
    whiteSpace: 'nowrap',
});
export const cnLeftYAxis = style({});
export const cnRightYAxis = style({
    color: '#0000FF',
});
