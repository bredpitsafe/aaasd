import { createTestProps } from '../../../../index';

export enum OrderBookTabSelectors {
    SelectInstrumentSelector = 'selectInstrumentSelector',
    InstrumentButton = 'instrumentButton',
    PlatformTimeButton = 'platformTimeButton',
    SelectDateSelector = 'pelectDateSelector',
    NanosecondInput = 'nanosecondInput',
    OrderBookDepthInput = 'orderBookDepthInput',
    ApplyButton = 'applyButton',
}

export const OrderBookTabProps = {
    [OrderBookTabSelectors.SelectInstrumentSelector]: createTestProps(
        OrderBookTabSelectors.SelectInstrumentSelector,
    ),
    [OrderBookTabSelectors.InstrumentButton]: createTestProps(
        OrderBookTabSelectors.InstrumentButton,
    ),
    [OrderBookTabSelectors.PlatformTimeButton]: createTestProps(
        OrderBookTabSelectors.PlatformTimeButton,
    ),
    [OrderBookTabSelectors.SelectDateSelector]: createTestProps(
        OrderBookTabSelectors.SelectDateSelector,
    ),
    [OrderBookTabSelectors.NanosecondInput]: createTestProps(OrderBookTabSelectors.NanosecondInput),
    [OrderBookTabSelectors.OrderBookDepthInput]: createTestProps(
        OrderBookTabSelectors.OrderBookDepthInput,
    ),
    [OrderBookTabSelectors.ApplyButton]: createTestProps(OrderBookTabSelectors.ApplyButton),
};
