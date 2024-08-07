import { EFiltersModalSelectors } from '@frontend/common/e2e/selectors/filters.modal.selectors';

import { Button } from '../../base/elements/button';
import { Input } from '../../base/elements/input';
import { Select } from '../../base/elements/select';

export class FiltersModal {
    readonly applyButton = new Button(EFiltersModalSelectors.ApplyButton);
    readonly resetButton = new Button(EFiltersModalSelectors.ResetButton);
    readonly backtestingIdInput = new Input(EFiltersModalSelectors.BacktestingIdInput);
    readonly strategiesIncludeSelector = new Select(
        EFiltersModalSelectors.StrategiesIncludeSelector,
    );
    readonly baseAssetsIncludeSelector = new Select(
        EFiltersModalSelectors.BaseAssetsIncludeSelector,
    );
    readonly volumeAssetsIncludeSelector = new Select(
        EFiltersModalSelectors.VolumeAssetsIncludeSelector,
    );
    readonly anyAssetsIncludeSelector = new Select(EFiltersModalSelectors.AnyAssetsIncludeSelector);
    readonly exchangesIncludeSelector = new Select(EFiltersModalSelectors.ExchangesIncludeSelector);
    readonly instrumentsIncludeSelector = new Select(
        EFiltersModalSelectors.InstrumentsIncludeSelector,
    );
    readonly strategiesExcludeSelector = new Select(
        EFiltersModalSelectors.StrategiesExcludeSelector,
    );
    readonly baseAssetsExcludeSelector = new Select(
        EFiltersModalSelectors.BaseAssetsExcludeSelector,
    );
    readonly volumeAssetsExcludeSelector = new Select(
        EFiltersModalSelectors.VolumeAssetsExcludeSelector,
    );
    readonly anyAssetsExcludeSelector = new Select(EFiltersModalSelectors.AnyAssetsExcludeSelector);
    readonly exchangesExcludeSelector = new Select(EFiltersModalSelectors.ExchangesExcludeSelector);
    readonly instrumentsExcludeSelector = new Select(
        EFiltersModalSelectors.InstrumentsExcludeSelector,
    );
    readonly dayCalendarInput = new Input(EFiltersModalSelectors.DayCalendarInput);
    readonly previousDayButton = new Select(EFiltersModalSelectors.PreviousDayButton);
    readonly nextDayButton = new Select(EFiltersModalSelectors.NextDayButton);

    readonly monthCalendarInput = new Input(EFiltersModalSelectors.MonthCalendarInput);
    readonly startDateCalendarInput = new Input(
        '[data-test="monthCalendarInput"] [placeholder="Start date"]',
        false,
    );
    readonly endDateCalendarInput = new Input(
        '[data-test="monthCalendarInput"] [placeholder="End date"]',
        false,
    );
    readonly previousMonthButton = new Select(EFiltersModalSelectors.PreviousMonthButton);
    readonly nextMonthButton = new Select(EFiltersModalSelectors.NextMonthButton);

    checkVisiblyFilter(): void {
        this.applyButton.checkVisible();
        this.resetButton.checkVisible();
        this.backtestingIdInput.checkVisible();
    }

    checkVisiblyIncludeFilter(): void {
        this.strategiesIncludeSelector.checkVisible();
        this.baseAssetsIncludeSelector.checkVisible();
        this.volumeAssetsIncludeSelector.checkVisible();
        this.anyAssetsIncludeSelector.checkVisible();
        this.exchangesIncludeSelector.checkVisible();
        this.exchangesIncludeSelector.checkVisible();
        this.instrumentsIncludeSelector.checkVisible();
    }

    checkVisiblyExcludeFilter(): void {
        this.strategiesExcludeSelector.checkVisible();
        this.baseAssetsExcludeSelector.checkVisible();
        this.volumeAssetsExcludeSelector.checkVisible();
        this.anyAssetsExcludeSelector.checkVisible();
        this.exchangesExcludeSelector.checkVisible();
        this.exchangesExcludeSelector.checkVisible();
        this.instrumentsExcludeSelector.checkVisible();
    }

    setDateInDayCalendar(date: string): void {
        this.dayCalendarInput.clickClearAndTypeText(date);
    }

    setDateInMonthlyCalendar(startDate: string, endDate: string): void {
        this.startDateCalendarInput.clickClearAndTypeText(startDate);
        this.endDateCalendarInput.clickClearAndTypeText(endDate);
    }
}

export const filtersModal = new FiltersModal();
