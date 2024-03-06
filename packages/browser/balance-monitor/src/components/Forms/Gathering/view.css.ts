import { styleInputPlaceHolder } from '@frontend/common/src/components/InputHelpers.css';
import { style } from '@frontend/common/src/utils/css/style.css';

export const cnGatheringFormLayout = style({
    containerType: 'inline-size',
    display: 'grid',
    gap: '8px',
    margin: '8px',
    gridTemplateColumns: 'repeat(3, 1fr)',
    vars: {
        '--amount-fields-row': '2',
        '--graph-fields-row': '1',
    },
    '@container': {
        [`(width >= 1500px)`]: {
            gridTemplateColumns: 'repeat(5, 1fr)',
            vars: {
                '--amount-fields-row': '1',
            },
        },
        [`(width <= 700px)`]: {
            gridTemplateColumns: 'repeat(2, 1fr)',
            vars: {
                '--amount-fields-row': 'unset',
                '--graph-fields-row': 'unset',
            },
        },
        [`(width <= 400px)`]: {
            gridTemplateColumns: '1fr',
            vars: {
                '--amount-fields-row': 'unset',
                '--graph-fields-row': 'unset',
            },
        },
    },
});

export const cnGraphRow = style({
    gridRow: 'var(--graph-fields-row)',
});

export const cnAmountRow = style({
    gridRow: 'var(--amount-fields-row)',
});

export const cnPercentageInput = style({});

styleInputPlaceHolder(cnPercentageInput, {
    color: '#595959',
});

export const cnActionsBlock = style({
    marginTop: 12,
});
