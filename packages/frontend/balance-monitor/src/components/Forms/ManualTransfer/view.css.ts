import { style } from '@frontend/common/src/utils/css/style.css';
import { globalStyle } from '@vanilla-extract/css';

export const cnTransferExists = style({
    fontWeight: 'bold',
});

export const cnAmountLabel = style({
    gap: '8px',
});

globalStyle(`${cnAmountLabel} > :last-child`, {
    marginLeft: '8px',
});
