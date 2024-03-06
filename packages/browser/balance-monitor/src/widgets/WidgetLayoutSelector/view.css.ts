import { specify } from '@frontend/common/src/utils/css/specify';
import { style } from '@frontend/common/src/utils/css/style.css';

export const cnFloatLinkButton = style({
    display: 'block',
    marginBottom: '16px',
});
export const cnFloatButtonNoMargin = style(
    specify({
        marginBottom: 0,
    }),
);
export const cnLinkButton = style({
    display: 'grid',
});

export const cnBadgeCount = style({
    zIndex: 1,
});

export const cnFullWidth = style({
    width: '100%',
});
