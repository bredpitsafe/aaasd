import { style } from '../../utils/css/style.css';

export const cnLegendContainer = style({
    display: 'flex',
    alignItems: 'center',
});
export const cnLegendIndicator = style({
    flex: '0 0 auto',
    display: 'inline-block',
    width: '6px',
    height: '6px',
    marginRight: '8px',
});
export const cnLegendIndicatorText = style({
    flex: '1 1 auto',
    minWidth: 0,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
});
