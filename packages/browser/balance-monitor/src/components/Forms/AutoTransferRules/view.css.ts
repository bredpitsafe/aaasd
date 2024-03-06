import { style } from '@frontend/common/src/utils/css/style.css';

export const cnAutoTransferRulesFormLayout = style({
    containerType: 'inline-size',
    display: 'grid',
    gap: '8px',
    margin: '8px',
    gridTemplateColumns: 'repeat(4, 1fr)',
    vars: {
        '--label-top-margin': '30px',
    },
    '@container': {
        [`(width >= 1400px)`]: {
            gridTemplateColumns: 'repeat(8, 1fr)',
        },
        [`(width <= 700px)`]: {
            gridTemplateColumns: 'repeat(2, 1fr)',
            vars: {
                '--label-top-margin': '0',
            },
        },
    },
});

export const cnWideCell = style({
    gridColumn: 'span 2',
});

export const cnAdvancedOptionsContainer = style({
    display: 'flex',
    flexFlow: 'row wrap',
    gap: '8px',
});

export const cnLabelVerticalSpace = style({
    display: 'flex',
    flexFlow: 'row nowrap',
    marginTop: 'var(--label-top-margin)',
    height: '32px',
    gap: '8px',
    alignItems: 'center',
});
