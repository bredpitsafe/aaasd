import { createTestProps } from '../../index';

export enum ETradingStatsSelectors {
    App = 'appTradingStats',
    DailyStatsButton = 'dailyStatsButton',
    MonthlyStatsButton = 'monthlyStatsButton',
    TradingSinceDateInput = 'tradingSinceDataInput',
    TradingTillDateInput = 'tradingTillDataInput',
}
export const ETradingStatsPageProps = {
    [ETradingStatsSelectors.App]: createTestProps(ETradingStatsSelectors.App),
    [ETradingStatsSelectors.DailyStatsButton]: createTestProps(
        ETradingStatsSelectors.DailyStatsButton,
    ),
    [ETradingStatsSelectors.MonthlyStatsButton]: createTestProps(
        ETradingStatsSelectors.MonthlyStatsButton,
    ),
    [ETradingStatsSelectors.TradingSinceDateInput]: createTestProps(
        ETradingStatsSelectors.TradingSinceDateInput,
    ),
    [ETradingStatsSelectors.TradingTillDateInput]: createTestProps(
        ETradingStatsSelectors.TradingTillDateInput,
    ),
};
