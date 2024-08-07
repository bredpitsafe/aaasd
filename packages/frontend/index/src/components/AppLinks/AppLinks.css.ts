import { style } from '@frontend/common/src/utils/css/style.css.ts';

export const cnRoot = style({
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '100px',
});

export const cnLinks = style({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '5px',
    flexWrap: 'wrap',
});

export const cnLogoContainer = style({
    width: '150px',
});

export const cnLogo = style({
    height: '100%',
    width: '100%',
    objectFit: 'contain',
});

export const cnLinkInner = style({
    padding: '5px',
    margin: '5px',
    display: 'flex',
    gap: '5px',
    alignItems: 'center',
});
