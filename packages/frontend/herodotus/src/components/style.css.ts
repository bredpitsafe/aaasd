import { blue } from '@ant-design/colors';
import { style } from '@frontend/common/src/utils/css/style.css';

export const cnEvenInstrumentRow = style({
    background: blue[0],
});
export const cnOddInstrumentRow = style({
    background: '#f1f1f1',
});

export const cnInstrument = style({
    padding: '4px',
    marginBottom: '4px',
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr) minmax(47px, auto)',
    gap: '4px',
});

export const cnInstrumentExchange = style({
    gridColumn: 1,
    gridRow: 1,
});

export const cnInstrumentAccount = style({
    gridColumn: 2,
    gridRow: 1,
});

export const cnInstrumentName = style({
    gridColumn: 3,
    gridRow: 1,
});

export const cnInstrumentInfo = style({
    gridColumn: '1 / 5',
    gridRow: 2,
    display: 'grid',
    gridTemplateColumns: 'auto 1fr auto',
    gap: '8px',
    gridAutoRows: 'min-content',
    gridAutoFlow: 'column',
});

const cnLabelValue = style({
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
});

export const cnLeftLabelValueData = style(cnLabelValue, {
    gridColumn: 1,
});

export const cnRightLabelValueData = style(cnLabelValue, {
    gridColumn: 3,
});

export const cnInstrumentInfoLabel = style({
    fontWeight: 'bold',
});

export const cnRowActions = style({
    gridColumn: 4,
    gridRow: 1,
});

export const cnInstrumentRole = style({
    gridColumn: 1,
    gridRow: 3,
});

export const cnInstrumentAggression = style({
    gridColumn: 2,
    gridRow: 3,
});

export const cnFundingActions = style({
    gridColumn: '3 / -1',
    gridRow: 3,

    display: 'flex',
    justifyContent: 'flex-end',
});

export const cnFullWidthRow = style({
    gridColumn: '1 / -1',
});
