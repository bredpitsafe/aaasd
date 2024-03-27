import { style } from '@frontend/common/src/utils/css/style.css';

export const cnCellIconContainer = style({
    display: 'inline-flex',
    alignItems: 'center',
    gap: '2px',
});

export const cnCellIcon = style({
    height: '18px',
    verticalAlign: 'middle',
});

export const cnItemsList = style({
    display: 'flex',
    flexWrap: 'wrap',
    gap: '12px',
});

export const cnAmount = style({
    fontWeight: 'bold',
    marginRight: '4px',
});

export const cnAmountContainer = style({
    display: 'flex',
    whiteSpace: 'nowrap',
});

export const cnAmountUsd = style({
    marginLeft: '8px',
});
