import { blue, orange } from '@ant-design/colors';
import {
    styleInputAddon,
    styleInputPlaceHolder,
} from '@frontend/common/src/components/InputHelpers.css';
import { style } from '@frontend/common/src/utils/css/style.css';

export const cnInternalTransfersFormLayout = style({
    containerType: 'inline-size',
    display: 'grid',
    gap: '8px',
    margin: '8px',
    gridTemplateColumns: 'repeat(2, 1fr)',
    '@container': {
        [`(width >= 1000px)`]: {
            gridTemplateColumns: 'repeat(4, 1fr)',
        },
        [`(width <= 400px)`]: {
            gridTemplateColumns: 'repeat(1, 1fr)',
        },
    },
});

export const cnFullWidth = style({
    gridColumn: '1 / -1',
});

export const cnActionsContainerWithOptions = style({
    display: 'flex',
    flexFlow: 'row wrap',
    gap: '8px',
    justifyContent: 'space-between',
});

export const cnActionsContainerEx = style({
    display: 'flex',
    flexFlow: 'row wrap',
    justifyContent: 'flex-end',
    gap: '8px',
    flex: '1 0 auto',
});

export const cnWarnColorIcon = style({
    color: orange[3],
});

export const cnPercentageInput = style({});

styleInputPlaceHolder(cnPercentageInput, {
    color: '#595959',
});

export const cnAvailableReadonlyInput = style({});

styleInputAddon(cnAvailableReadonlyInput, {
    padding: 0,
});

export const cnUseAllAvailableBalance = style({
    height: '30px',
    lineHeight: '20px',
});

export const cnCoinWithBalance = style({
    display: 'flex',
    flexFlow: 'row',
    justifyContent: 'space-between',
    gap: '8px',
});

export const cnCoinBalance = style({
    fontSize: 'smaller',
    color: blue[6],
});

export const cnLowBalanceOptionContainer = style({
    flex: '0 1 auto',
    display: 'flex',
});
