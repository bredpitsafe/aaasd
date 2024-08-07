import { StepBackwardOutlined, StepForwardOutlined } from '@ant-design/icons';
import type { TimeZone } from '@common/types';
import { EDateTimeFormats } from '@common/types';
import { getNowDayjs, parseToDayjsInTimeZone } from '@common/utils';
import {
    EFiltersModalProps,
    EFiltersModalSelectors,
} from '@frontend/common/e2e/selectors/filters.modal.selectors';
import { Button } from '@frontend/common/src/components/Button';
import { rangeDatePickerWithTimeZoneBuilder } from '@frontend/common/src/components/DatePicker/utils';
import { FormikForm } from '@frontend/common/src/components/Formik';
import { Space } from '@frontend/common/src/components/Space';
import { useFunction } from '@frontend/common/src/utils/React/useFunction';
import type { Dayjs } from 'dayjs';
import { isNil } from 'lodash-es';
import type { EventValue } from 'rc-picker/lib/interface';
import type { ReactElement } from 'react';
import { useMemo } from 'react';

import type { TradingStatsFilterViewProps } from './commonFilterView';
import { CommonFilterView } from './commonFilterView';

// 8 labels is a maximum number that fits below the calendar in a single row.
const MONTH_LABELS_COUNT = 8;

// Generate N months ranges, starting with the current month.
function generateMonthRanges(
    timeZone: TimeZone,
): Record<string, [EventValue<Dayjs>, EventValue<Dayjs>]> {
    const now = getNowDayjs(timeZone);

    return Array.from(Array(MONTH_LABELS_COUNT)).reduce((acc, _, i) => {
        const monthIndexFromNow = MONTH_LABELS_COUNT - i - 1;
        const startDate = now.subtract(monthIndexFromNow, 'month').startOf('month');
        const endDate =
            monthIndexFromNow === 0 ? now : now.subtract(monthIndexFromNow, 'month').endOf('month');

        acc[startDate.format(EDateTimeFormats.MonthYear)] = [startDate, endDate];

        return acc;
    }, {});
}

export function MonthlyStatsFilterView(props: TradingStatsFilterViewProps): ReactElement {
    const { values, timeZone, setFieldValue, submitForm } = props;

    const cbSetDateRange = useFunction((_: unknown, [date, to]: [string, string]) => {
        setFieldValue('date', date);
        setFieldValue('to', to);
    });

    const value: [EventValue<Dayjs>, EventValue<Dayjs>] | undefined = useMemo(() => {
        const date = createDate(values.date, timeZone);
        const to = createDate(values.to, timeZone);
        return date && to ? [date, to] : undefined;
    }, [timeZone, values.date, values.to]);

    const cbNextDate = useFunction(async () => {
        const validDate = createDate(values.date, timeZone) ?? getNowDayjs(timeZone);

        const nextStartDate = validDate.add(1, 'month').startOf('month');
        const nextEndDate = validDate.add(1, 'month').endOf('month');

        // If the next `to` date is in the future, limit it to current date.
        const nextStartDateStr = nextStartDate.format(EDateTimeFormats.Date);
        const nextEndDateStr = (
            nextEndDate.diff() > 0 ? getNowDayjs(timeZone) : nextEndDate
        ).format(EDateTimeFormats.Date);

        setFieldValue('date', nextStartDateStr);
        setFieldValue('to', nextEndDateStr);
        await submitForm();
    });

    const cbPrevDate = useFunction(async () => {
        const validDate = createDate(values.date, timeZone) ?? getNowDayjs(timeZone);

        const nextStartDateStr = validDate
            .subtract(1, 'month')
            .startOf('month')
            .format(EDateTimeFormats.Date);
        const nextEndDateStr = validDate
            .subtract(1, 'month')
            .endOf('month')
            .format(EDateTimeFormats.Date);

        setFieldValue('date', nextStartDateStr);
        setFieldValue('to', nextEndDateStr);
        await submitForm();
    });

    const cbDisabledDate = useFunction((date: Dayjs) => {
        return date.diff() > 0;
    });

    const nextDateButtonDisabled = useMemo(() => {
        const diff = createDate(values.to, timeZone)?.endOf('day').diff();
        return diff !== undefined && diff > 0;
    }, [values.to, timeZone]);

    const ranges = useMemo(() => generateMonthRanges(timeZone), [timeZone]);

    const RangePicker = rangeDatePickerWithTimeZoneBuilder(timeZone);

    return (
        <CommonFilterView {...props}>
            <FormikForm.Item name="date" label="Interval">
                <Space.Compact block>
                    <RangePicker
                        {...EFiltersModalProps[EFiltersModalSelectors.MonthCalendarInput]}
                        format={EDateTimeFormats.Date}
                        value={value}
                        ranges={ranges}
                        onChange={cbSetDateRange}
                        disabledDate={cbDisabledDate}
                    />
                    <Button
                        {...EFiltersModalProps[EFiltersModalSelectors.PreviousMonthButton]}
                        type="primary"
                        title="Previous Month"
                        onClick={cbPrevDate}
                    >
                        <StepBackwardOutlined />
                    </Button>
                    <Button
                        {...EFiltersModalProps[EFiltersModalSelectors.NextMonthButton]}
                        type="primary"
                        title="Next Month"
                        disabled={nextDateButtonDisabled}
                        onClick={cbNextDate}
                    >
                        <StepForwardOutlined />
                    </Button>
                </Space.Compact>
            </FormikForm.Item>
        </CommonFilterView>
    );
}

function createDate(value: string | undefined, timeZone: TimeZone): Dayjs | undefined {
    if (isNil(value)) {
        return undefined;
    }

    const date = parseToDayjsInTimeZone(value, timeZone, EDateTimeFormats.Date);

    return date.isValid() ? date : undefined;
}
