import { blue, green, grey, red } from '@ant-design/colors';
import { globalStyle } from '@vanilla-extract/css';
import Color from 'color';

import { style } from '../../../utils/css/style.css';

export const styleColumn1 = style({
    gridColumn: 1,
});

export const styleColumn2 = style({
    gridColumn: 2,
});

export const styleColumn3 = style({
    gridColumn: 3,
});

export const styleColumn4 = style({
    gridColumn: 4,
});

export const styleColumn5 = style({
    gridColumn: 5,
});

export const styleColumn6 = style({
    gridColumn: 6,
});

export const styleColumn7 = style({
    gridColumn: 7,
});

export const styleColumn8 = style({
    gridColumn: 8,
});

export const styleSpan2 = style({
    gridColumn: 'span 2',
});

export const styleSpan5 = style({
    gridColumn: 'span 5',
});

export const styleOrderBookPageView = style({
    flex: '1 1 auto',
    minHeight: '0',
    display: 'flex',
    flexFlow: 'row',
    alignItems: 'stretch',
    height: '100%',
});

export const styleOrderBookContainer = style({
    flex: '1 1 auto',
    minWidth: 0,
});

export const styleNavigationControls = style({
    flex: '0 0 310px',
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    margin: '0 0 0 5px',
    alignContent: 'flex-start',
});

export const styleNavigationButton = style({
    margin: 0,
});

export const styleNavigationLabel = style({
    margin: '10px 0 5px 0',
    whiteSpace: 'nowrap',
    gridColumn: 'span 2',
    fontSize: '14px',
});

export const styleNavigationLabelValue = style({
    margin: '2px 0',
    whiteSpace: 'nowrap',
    gridColumn: 'span 2',
    fontSize: '14px',
});

export const styleOrderBook = style({
    height: '100%',
    borderColor: grey[0],
    borderWidth: '1px',
    borderStyle: 'solid',
});

export const styleDepthOfMarketWrapper = style({
    height: '100%',
    overflowY: 'scroll',
    overflowX: 'auto',
});

export const styleDepthOfMarket = style({
    display: 'grid',
    gridTemplateColumns:
        'repeat(2, minmax(max-content, 70px) minmax(max-content, 70px) 200px) auto 1fr',
});

export const styleAmountChange = style({
    padding: '0 2px 0 10px',
    flex: '0 0 auto',
    textAlign: 'end',
});

export const styleNegative = style({
    color: red[7],
});

export const stylePositive = style({
    color: green[7],
});

export const styleAmountColumn = style({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding: '2px 2px',
});

export const styleAmountChangeColumn = style({
    padding: '2px 2px',
    display: 'flex',
    justifyContent: 'flex-end',
});

export const styleAmountBoxColumn = style({
    padding: '2px 2px',
    display: 'flex',
    alignItems: 'center',
});

export const styleBox = style({
    height: '1em',
});

export const styleBoxBid = style({
    backgroundColor: green[2],
});

export const styleBoxAsk = style({
    backgroundColor: red[2],
});

export const styleChangedBid = style({
    backgroundColor: new Color(green[1]).toString(),
});

export const styleChangedAsk = style({
    backgroundColor: new Color(red[1]).toString(),
});

export const styleDepthSelector = style({
    marginBottom: '10px',
});

export const styleDepthInput = style({
    width: '70px',
    paddingRight: 0,
});

export const styleHighlightChangedText = style({
    color: new Color('#000').alpha(0.65).toString(),
});

export const styleFeedColumn = style({
    padding: '0 10px 0 2px',
    display: 'flex',
    flexFlow: 'row',
    alignItems: 'center',
});

export const styleFeedLabel = style({
    flex: '1 0 auto',
});

export const styleInstrumentSelector = style({
    marginBottom: '10px',
});

export const styleOrderBookForm = style({
    marginBottom: '10px',
});

export const styleApplyButton = style({
    width: '100%',
});

export const stylePlatformTimeSelector = style({
    marginBottom: '10px',
    width: '310px',
});

globalStyle(`${stylePlatformTimeSelector} .ant-form-item-control-input-content`, {
    display: 'flex',
    flexWrap: 'nowrap',
});

export const stylePlatformTimeCalendar = style({
    flex: '1 0 190px',
});

export const stylePlatformTimeNanoseconds = style({
    paddingRight: 0,
});

export const stylePriceColumn = style({
    padding: '0 10px',
    display: 'flex',
    alignItems: 'center',
});

export const styleInstrumentSelectorInput = style({
    minWidth: '300px',
});

export const stylePricePad = style({
    color: new Color('#000').alpha(0.55).toString(),
});

export const styleAdditionalSpace = style({
    gridColumn: '1 /-1',
    height: '500px',
});

export const styleGridRow = style({
    display: 'contents',
    ':hover': {
        backgroundColor: 'red',
    },
});

globalStyle(`${styleGridRow}:hover > *`, {
    backgroundColor: blue[0],
});

export const styleLastMultiFeed = style({
    paddingLeft: '2px',
});
