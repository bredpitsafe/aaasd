import { EFiltersModalSelectors } from '@frontend/common/e2e/selectors/filters.modal.selectors';

import { Button } from '../../base/elements/button';
import { Input } from '../../base/elements/input';
import { SelectVirtualList } from '../../base/elements/selectVirtualList';

export class FiltersModal {
    readonly applyButton = new Button(EFiltersModalSelectors.ApplyButton);
    readonly resetButton = new Button(EFiltersModalSelectors.ResetButton);
    readonly backtestingIdInput = new Input(EFiltersModalSelectors.BacktestingIdInput);
    readonly strategiesIncludeSelector = new SelectVirtualList(
        EFiltersModalSelectors.StrategiesIncludeSelector,
    );
    readonly baseAssetsIncludeSelector = new SelectVirtualList(
        EFiltersModalSelectors.BaseAssetsIncludeSelector,
    );
    readonly quoteAssetsIncludeSelector = new SelectVirtualList(
        EFiltersModalSelectors.QuoteAssetsIncludeSelector,
    );
    readonly anyAssetsIncludeSelector = new SelectVirtualList(
        EFiltersModalSelectors.AnyAssetsIncludeSelector,
    );
    readonly exchangesIncludeSelector = new SelectVirtualList(
        EFiltersModalSelectors.ExchangesIncludeSelector,
    );
    readonly instrumentsIncludeSelector = new SelectVirtualList(
        EFiltersModalSelectors.InstrumentsIncludeSelector,
    );
    readonly strategiesExcludeSelector = new SelectVirtualList(
        EFiltersModalSelectors.StrategiesExcludeSelector,
    );
    readonly baseAssetsExcludeSelector = new SelectVirtualList(
        EFiltersModalSelectors.BaseAssetsExcludeSelector,
    );
    readonly quoteAssetsExcludeSelector = new SelectVirtualList(
        EFiltersModalSelectors.QuoteAssetsExcludeSelector,
    );
    readonly anyAssetsExcludeSelector = new SelectVirtualList(
        EFiltersModalSelectors.AnyAssetsExcludeSelector,
    );
    readonly exchangesExcludeSelector = new SelectVirtualList(
        EFiltersModalSelectors.ExchangesExcludeSelector,
    );
    readonly instrumentsExcludeSelector = new SelectVirtualList(
        EFiltersModalSelectors.InstrumentsExcludeSelector,
    );
    readonly dayCalendarInput = new Input(EFiltersModalSelectors.DayCalendarInput);
    readonly previousDayButton = new SelectVirtualList(EFiltersModalSelectors.PreviousDayButton);
    readonly nextDayButton = new SelectVirtualList(EFiltersModalSelectors.NextDayButton);

    readonly monthCalendarInput = new Input(EFiltersModalSelectors.MonthCalendarInput);
    readonly startDateCalendarInput = new Input(
        '[data-test="monthCalendarInput"] [placeholder="Start date"]',
        false,
    );
    readonly endDateCalendarInput = new Input(
        '[data-test="monthCalendarInput"] [placeholder="End date"]',
        false,
    );
    readonly previousMonthButton = new SelectVirtualList(
        EFiltersModalSelectors.PreviousMonthButton,
    );
    readonly nextMonthButton = new SelectVirtualList(EFiltersModalSelectors.NextMonthButton);

    checkVisiblyFilter(): void {
        this.applyButton.checkVisible();
        this.resetButton.checkVisible();
        this.backtestingIdInput.checkVisible();
    }

    checkVisiblyIncludeFilter(): void {
        this.strategiesIncludeSelector.checkVisible();
        this.baseAssetsIncludeSelector.checkVisible();
        this.quoteAssetsIncludeSelector.checkVisible();
        this.anyAssetsIncludeSelector.checkVisible();
        this.exchangesIncludeSelector.checkVisible();
        this.exchangesIncludeSelector.checkVisible();
        this.instrumentsIncludeSelector.checkVisible();
    }

    checkVisiblyExcludeFilter(): void {
        this.strategiesExcludeSelector.checkVisible();
        this.baseAssetsExcludeSelector.checkVisible();
        this.quoteAssetsExcludeSelector.checkVisible();
        this.anyAssetsExcludeSelector.checkVisible();
        this.exchangesExcludeSelector.checkVisible();
        this.exchangesExcludeSelector.checkVisible();
        this.instrumentsExcludeSelector.checkVisible();
    }

    setDateInDayCalendar(date: string): void {
        this.dayCalendarInput.click();
        this.dayCalendarInput.clearAndType(date);
        this.dayCalendarInput.type('{enter}');
    }

    setDateInMonthlyCalendar(startDate: string, endDate: string): void {
        this.startDateCalendarInput.click();
        this.startDateCalendarInput.clearAndType(startDate);
        this.startDateCalendarInput.type('{enter}');
        this.endDateCalendarInput.click();
        this.endDateCalendarInput.clearAndType(endDate);
        this.endDateCalendarInput.type('{enter}');
    }
}

export const filtersModal = new FiltersModal();
