import { StepBackwardOutlined, StepForwardOutlined } from '@ant-design/icons';
import {
    EFiltersModalProps,
    EFiltersModalSelectors,
} from '@frontend/common/e2e/selectors/filters.modal.selectors';
import { Button } from '@frontend/common/src/components/Button';
import { DatePicker } from '@frontend/common/src/components/DatePicker';
import { FormikForm } from '@frontend/common/src/components/Formik';
import { Space } from '@frontend/common/src/components/Space';
import { EDateTimeFormats } from '@frontend/common/src/types/time';
import { useFunction } from '@frontend/common/src/utils/React/useFunction';
import {
    getNowDayjs,
    parseToDayjsInTimeZone,
    toDayjsWithTimezone,
} from '@frontend/common/src/utils/time';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import { isNil } from 'lodash-es';
import { ReactElement, useMemo } from 'react';

import { CommonFilterView, TradingStatsFilterViewProps } from './commonFilterView';

export function DailyStatsFilterView(props: TradingStatsFilterViewProps): ReactElement {
    const { values, timeZone, setFieldValue, submitForm } = props;

    const valueDate = useMemo(() => {
        if (isNil(values.date)) {
            return undefined;
        }

        const date = parseToDayjsInTimeZone(values.date, timeZone, EDateTimeFormats.Date);

        return date.isValid() ? date : undefined;
    }, [timeZone, values.date]);

    const filterDate = useMemo(() => valueDate ?? getNowDayjs(timeZone), [timeZone, valueDate]);

    const cbSetDate = useFunction((value: Dayjs | null) => {
        setFieldValue(
            'date',
            isNil(value)
                ? value
                : toDayjsWithTimezone(value, timeZone).format(EDateTimeFormats.Date),
        );
    });

    const cbNextDate = useFunction(async () => {
        const nextDateStr = filterDate.add(1, 'day').format(EDateTimeFormats.Date);

        setFieldValue('date', nextDateStr);
        await submitForm();
    });

    const cbPrevDate = useFunction(async () => {
        const nextDateStr = filterDate.subtract(1, 'day').format(EDateTimeFormats.Date);

        setFieldValue('date', nextDateStr);
        await submitForm();
    });

    const cbDisabledDate = useFunction((date: Dayjs) => {
        return date.diff() > 0;
    });

    const nextDateButtonDisabled = useMemo(() => {
        return dayjs(values.date, EDateTimeFormats.Date).endOf('day').diff() > 0;
    }, [values.date]);

    return (
        <CommonFilterView {...props}>
            <FormikForm.Item name="date" label="Date">
                <Space.Compact block>
                    <DatePicker
                        {...EFiltersModalProps[EFiltersModalSelectors.DayCalendarInput]}
                        format={EDateTimeFormats.Date}
                        value={valueDate}
                        onChange={cbSetDate}
                        disabledDate={cbDisabledDate}
                        timeZone={timeZone}
                    />
                    <Button
                        {...EFiltersModalProps[EFiltersModalSelectors.PreviousDayButton]}
                        type="primary"
                        title="Previous Day"
                        onClick={cbPrevDate}
                    >
                        <StepBackwardOutlined />
                    </Button>
                    <Button
                        {...EFiltersModalProps[EFiltersModalSelectors.NextDayButton]}
                        type="primary"
                        title="Next Day"
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
