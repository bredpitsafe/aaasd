import { red } from '@ant-design/colors';
import { style } from '@frontend/common/src/utils/css/style.css';

export const cnTransferBlockingRulesFormLayout = style({
    containerType: 'inline-size',
    display: 'grid',
    gap: '8px',
    margin: '8px',
    gridTemplateColumns: 'repeat(4, 1fr)',
    '@container': {
        [`(width >= 1500px)`]: {
            gridTemplateColumns: 'repeat(8, 1fr) repeat(2, 80px)',
        },
        [`(width <= 700px)`]: {
            gridTemplateColumns: 'repeat(2, 1fr)',
        },
    },
});

export const cnWideCell = style({
    gridColumn: 'span 2',
});

export const cnNowrapContainer = style({
    display: 'flex',
    flexFlow: 'row nowrap',
    gap: '8px',
});

export const cnWrapContainer = style({
    display: 'flex',
    flexFlow: 'row wrap',
    gap: '8px',
});

export const cnEndPeriodValue = style({
    width: '120px',
});

export const cnEndPeriodUnit = style({
    width: '85px',
});

export const cnEndPeriodDate = style({
    width: '180px',
});

export const cnSwitchesLayout = style({
    containerType: 'inline-size',
    display: 'grid',
    gap: '8px',
    margin: '8px',
    gridTemplateColumns: '200px 1fr',
    '@container': {
        [`(width >= 600px)`]: {
            gridTemplateColumns: '200px 200px 1fr',
        },
        [`(width < 400px)`]: {
            gridTemplateColumns: '1fr',
        },
    },
});

export const cnAlert = style({
    color: red[5],
});
