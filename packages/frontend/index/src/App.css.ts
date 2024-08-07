import { grey } from '@frontend/common/src/utils/colors';
import { style } from '@frontend/common/src/utils/css/style.css.ts';

export const cnRoot = style({
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
});

export const cnContent = style({
    flex: '1 1 auto',
});

export const cnFooter = style({
    flex: '0 0 auto',
    display: 'flex',
    alignItems: 'center',
});

export const cnExternalLinks = style({
    flex: '1 1 auto',
});

export const cnBuildInfo = style({
    flex: '0 0 auto',
    padding: '5px',
    color: grey.primary,
});
