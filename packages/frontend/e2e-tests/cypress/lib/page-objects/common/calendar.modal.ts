import { ECalendarSelectors } from '@frontend/common/e2e/selectors/calendar.selectors';

import { Button } from '../../base/elements/button';
import { Input } from '../../base/elements/input';
import { Text } from '../../base/elements/text';
import { TDataTask } from '../../interfaces/backtesting/dataTack';

export enum ECalendarModalSelectors {
    CalendarModal = '[class=ant-picker-panel-container]',
    NowButton = '[class=ant-picker-panel-container] [class=ant-picker-now]',
    OkButton = '[class=ant-picker-panel-container] [class=ant-picker-ok]',
    HeaderPanel = '[class=ant-picker-header]',
    DataPanel = '[class=ant-picker-date-panel]',
    TimePanel = '[class=ant-picker-time-panel]',
    DeleteButton = '[aria-label=close-circle]',
    MonthButton = '[class=ant-picker-month-btn]',
    YearButton = '[class=ant-picker-year-btn]',
    SuperPreviewButton = '[class=ant-picker-header-super-prev-btn]',
    PreviewButton = '[class=ant-picker-prev-icon]',
    SuperNextButton = '[class=ant-picker-header-super-next-btn]',
    NextButton = '[class=ant-picker-next-icon]',
    ItemButton = '[class=ant-picker-cell-inner]',
}
class CalendarModal {
    readonly startDateInput = new Input(ECalendarSelectors.StartDateInput);
    readonly endDateInput = new Input(ECalendarSelectors.EndDateInput);
    readonly calendarModal = new Text(ECalendarModalSelectors.CalendarModal, false);
    readonly nowButton = new Button(ECalendarModalSelectors.NowButton, false);
    readonly okButton = new Button(ECalendarModalSelectors.OkButton, false);
    readonly headerPanel = new Button(ECalendarModalSelectors.HeaderPanel, false);
    readonly dataPanel = new Button(ECalendarModalSelectors.DataPanel, false);
    readonly timePanel = new Button(ECalendarModalSelectors.TimePanel, false);
    readonly deleteButton = new Button(ECalendarModalSelectors.DeleteButton, false);
    readonly monthButton = new Button(ECalendarModalSelectors.MonthButton, false);
    readonly yearButton = new Button(ECalendarModalSelectors.YearButton, false);
    readonly superPreviewButton = new Button(ECalendarModalSelectors.SuperPreviewButton, false);
    readonly previewButton = new Button(ECalendarModalSelectors.PreviewButton, false);
    readonly superNextButton = new Button(ECalendarModalSelectors.SuperNextButton, false);
    readonly nextButton = new Button(ECalendarModalSelectors.NextButton, false);
    readonly itemButton = new Button(ECalendarModalSelectors.ItemButton, false);

    selectDataInCalendar(data: TDataTask) {
        this.startDateInput.clickLast();
        this.startDateInput.get().last().type(data.simStartTimes[0]);
        this.startDateInput.get().last().type('{enter}');
        this.endDateInput.clickLast();
        this.endDateInput.get().last().type(data.simEndTimes[0]);
        this.endDateInput.get().last().type('{enter}');
    }
}

export const calendarModal = new CalendarModal();
