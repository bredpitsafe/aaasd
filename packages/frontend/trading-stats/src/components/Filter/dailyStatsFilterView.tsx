import { StepBackwardOutlined, StepForwardOutlined } from '@ant-design/icons';
import { EDateTimeFormats } from '@common/types';
import { parseToDayjsInTimeZone, toDayjsWithTimezone } from '@common/utils';
import {
    EFiltersModalProps,
    EFiltersModalSelectors,
} from '@frontend/common/e2e/selectors/filters.modal.selectors';
import { Button } from '@frontend/common/src/components/Button';
import { DatePicker } from '@frontend/common/src/components/DatePicker';
import { FormikForm } from '@frontend/common/src/components/Formik';
import { Space } from '@frontend/common/src/components/Space';
import { useFunction } from '@frontend/common/src/utils/React/useFunction';
import type { Dayjs } from 'dayjs';
import { isNil } from 'lodash-es';
import type { ReactElement } from 'react';
import { useMemo } from 'react';

import type { TradingStatsFilterViewProps } from './commonFilterView';
import { CommonFilterView } from './commonFilterView';

export function DailyStatsFilterView(props: TradingStatsFilterViewProps): ReactElement {
    const { values, timeZone, setFieldValue, submitForm } = props;

    const valueDate = useMemo(() => {
        if (isNil(values.date)) {
            return undefined;
        }

        const date = parseToDayjsInTimeZone(values.date, timeZone, EDateTimeFormats.Date);

        return date.isValid() ? date : undefined;
    }, [timeZone, values.date]);

    const cbSetDate = useFunction((value: Dayjs | null) => {
        setFieldValue(
            'date',
            isNil(value)
                ? value
                : toDayjsWithTimezone(value, timeZone).format(EDateTimeFormats.Date),
        );
    });

    const cbNextDate = useFunction(async () => {
        if (isNil(valueDate)) {
            return;
        }

        const nextDateStr = valueDate.add(1, 'day').format(EDateTimeFormats.Date);

        setFieldValue('date', nextDateStr);
        await submitForm();
    });

    const cbPrevDate = useFunction(async () => {
        if (isNil(valueDate)) {
            return;
        }

        const nextDateStr = valueDate.subtract(1, 'day').format(EDateTimeFormats.Date);

        setFieldValue('date', nextDateStr);
        await submitForm();
    });

    const cbDisabledDate = useFunction((date: Dayjs) => {
        return date.diff() > 0;
    });

    const prevDateButtonDisabled = useMemo(() => {
        return isNil(valueDate);
    }, [valueDate]);

    const nextDateButtonDisabled = useMemo(() => {
        return isNil(valueDate) || valueDate.endOf('day').diff() > 0;
    }, [valueDate]);

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
                        disabled={prevDateButtonDisabled}
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
