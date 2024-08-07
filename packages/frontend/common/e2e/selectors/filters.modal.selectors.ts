import { createTestProps } from '../index';

export enum EFiltersModalSelectors {
    ApplyButton = 'applyButton',
    ResetButton = 'resetButton',
    BacktestingIdInput = 'backtestingIdInput',
    StrategiesIncludeSelector = 'strategiesIncludeSelector',
    BaseAssetsIncludeSelector = 'baseAssetsIncludeSelector',
    VolumeAssetsIncludeSelector = 'volumeAssetsIncludeSelector',
    AnyAssetsIncludeSelector = 'anyAssetsIncludeSelector',
    ExchangesIncludeSelector = 'exchangesIncludeSelector',
    InstrumentsIncludeSelector = 'instrumentsIncludeSelector',
    StrategiesExcludeSelector = 'strategiesExcludeSelector',
    BaseAssetsExcludeSelector = 'baseAssetsExcludeSelector',
    VolumeAssetsExcludeSelector = 'volumeAssetsExcludeSelector',
    AnyAssetsExcludeSelector = 'anyAssetsExcludeSelector',
    ExchangesExcludeSelector = 'exchangesExcludeSelector',
    InstrumentsExcludeSelector = 'instrumentsExcludeSelector',
    DayCalendarInput = 'dayCalendarInput',
    PreviousDayButton = 'previousDayButton',
    NextDayButton = 'nextDayButton',
    MonthCalendarInput = 'monthCalendarInput',
    PreviousMonthButton = 'previousMonthButton',
    NextMonthButton = 'nextMonthButton',
}

export const EFiltersModalProps = {
    [EFiltersModalSelectors.ApplyButton]: createTestProps(EFiltersModalSelectors.ApplyButton),
    [EFiltersModalSelectors.ResetButton]: createTestProps(EFiltersModalSelectors.ResetButton),
    [EFiltersModalSelectors.BacktestingIdInput]: createTestProps(
        EFiltersModalSelectors.BacktestingIdInput,
    ),
    [EFiltersModalSelectors.StrategiesIncludeSelector]: createTestProps(
        EFiltersModalSelectors.StrategiesIncludeSelector,
    ),
    [EFiltersModalSelectors.BaseAssetsIncludeSelector]: createTestProps(
        EFiltersModalSelectors.BaseAssetsIncludeSelector,
    ),
    [EFiltersModalSelectors.VolumeAssetsIncludeSelector]: createTestProps(
        EFiltersModalSelectors.VolumeAssetsIncludeSelector,
    ),
    [EFiltersModalSelectors.AnyAssetsIncludeSelector]: createTestProps(
        EFiltersModalSelectors.AnyAssetsIncludeSelector,
    ),
    [EFiltersModalSelectors.ExchangesIncludeSelector]: createTestProps(
        EFiltersModalSelectors.ExchangesIncludeSelector,
    ),
    [EFiltersModalSelectors.InstrumentsIncludeSelector]: createTestProps(
        EFiltersModalSelectors.InstrumentsIncludeSelector,
    ),
    [EFiltersModalSelectors.StrategiesExcludeSelector]: createTestProps(
        EFiltersModalSelectors.StrategiesExcludeSelector,
    ),
    [EFiltersModalSelectors.BaseAssetsExcludeSelector]: createTestProps(
        EFiltersModalSelectors.BaseAssetsExcludeSelector,
    ),
    [EFiltersModalSelectors.VolumeAssetsExcludeSelector]: createTestProps(
        EFiltersModalSelectors.VolumeAssetsExcludeSelector,
    ),
    [EFiltersModalSelectors.AnyAssetsExcludeSelector]: createTestProps(
        EFiltersModalSelectors.AnyAssetsExcludeSelector,
    ),
    [EFiltersModalSelectors.ExchangesExcludeSelector]: createTestProps(
        EFiltersModalSelectors.ExchangesExcludeSelector,
    ),
    [EFiltersModalSelectors.InstrumentsExcludeSelector]: createTestProps(
        EFiltersModalSelectors.InstrumentsExcludeSelector,
    ),
    [EFiltersModalSelectors.DayCalendarInput]: createTestProps(
        EFiltersModalSelectors.DayCalendarInput,
    ),
    [EFiltersModalSelectors.PreviousDayButton]: createTestProps(
        EFiltersModalSelectors.PreviousDayButton,
    ),
    [EFiltersModalSelectors.NextDayButton]: createTestProps(EFiltersModalSelectors.NextDayButton),
    [EFiltersModalSelectors.MonthCalendarInput]: createTestProps(
        EFiltersModalSelectors.MonthCalendarInput,
    ),
    [EFiltersModalSelectors.PreviousMonthButton]: createTestProps(
        EFiltersModalSelectors.PreviousMonthButton,
    ),
    [EFiltersModalSelectors.NextMonthButton]: createTestProps(
        EFiltersModalSelectors.NextMonthButton,
    ),
};
