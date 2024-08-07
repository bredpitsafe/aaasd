import { SnippetsOutlined } from '@ant-design/icons';
import type { Milliseconds, Nanoseconds, Seconds, TimeZone } from '@common/types';
import { EDateTimeFormats } from '@common/types';
import {
    formatNanoDate,
    getPlatformTimeValues,
    milliseconds2seconds,
    seconds2milliseconds,
} from '@common/utils';
import { extractValidNumber } from '@common/utils/src/extract.ts';
import cn from 'classnames';
import type { FieldProps, FormikProps } from 'formik';
import { Field } from 'formik-antd';
import { defer, isEmpty, isNil } from 'lodash-es';
import { memo, useMemo } from 'react';
import * as Yup from 'yup';

import {
    OrderBookTabProps,
    OrderBookTabSelectors,
} from '../../../../e2e/selectors/trading-servers-manager/components/order-book-tab/order-book.tab.selectors';
import { clipboardRead } from '../../../utils/clipboard';
import { useFunction } from '../../../utils/React/useFunction';
import { Button } from '../../Button';
import { FormikForm, FormikInput } from '../../Formik';
import { FormikDatePicker } from '../../Formik/components/FormikDataPicker';
import {
    stylePlatformTimeCalendar,
    stylePlatformTimeNanoseconds,
    stylePlatformTimeSelector,
} from './style.css';

const FIELD_NAME_CALENDAR = 'platformTimeMs';
const FIELD_NAME_NANOSECONDS = 'platformTimeNsPart';
export const PLATFORM_TIME_SCHEMA = {
    [FIELD_NAME_CALENDAR]: Yup.number().required(),
    [FIELD_NAME_NANOSECONDS]: Yup.number().optional(),
};

export type TPlatformTime = {
    [FIELD_NAME_CALENDAR]?: Milliseconds;
    [FIELD_NAME_NANOSECONDS]?: Nanoseconds;
};

export type TPlatformTimeSelectorProps = {
    timeZone: TimeZone;
    onError(error: string): void;
};

export const PlatformTimeSelector = memo(({ timeZone, onError }: TPlatformTimeSelectorProps) => {
    const updatePlatformTime = useFunction(
        async ({ setFieldValue, setFieldTouched, validateForm }: FormikProps<TPlatformTime>) => {
            const clipboardData = (await clipboardRead()).trim();

            const date = getPlatformTimeValues(clipboardData, timeZone);

            if (isNil(date)) {
                if (isEmpty(clipboardData)) {
                    onError(`Clipboard doesn't contain data`);
                } else {
                    onError('Clipboard data is not supported');
                }
                return;
            }

            setFieldTouched(FIELD_NAME_CALENDAR);
            setFieldTouched(FIELD_NAME_NANOSECONDS);
            setFieldValue(
                FIELD_NAME_CALENDAR,
                seconds2milliseconds(
                    Math.trunc(milliseconds2seconds(date.millisecondsOf())) as Seconds,
                ),
                false,
            );
            setFieldValue(
                FIELD_NAME_NANOSECONDS,
                extractValidNumber(
                    formatNanoDate(date, EDateTimeFormats.SubSecondPart, timeZone),
                ) || undefined,
                false,
            );
            // Unknown bug - setFieldValue is probably async operation and the value is not set immediately
            defer(async () => await validateForm());
        },
    );

    const clipboardButton = useMemo(
        () => (
            // @ts-ignore
            <Field name={FIELD_NAME_CALENDAR}>
                {({ form }: FieldProps) => (
                    <Button
                        {...OrderBookTabProps[OrderBookTabSelectors.PlatformTimeButton]}
                        type="text"
                        icon={<SnippetsOutlined />}
                        title="Fill platform time from unix timestamp"
                        onClick={() => updatePlatformTime(form)}
                    />
                )}
            </Field>
        ),
        [updatePlatformTime],
    );

    return (
        <>
            <FormikForm.Item
                className={stylePlatformTimeSelector}
                name={FIELD_NAME_CALENDAR}
                label={
                    <>
                        <span>Platform Time</span>
                        {clipboardButton}
                    </>
                }
            >
                <FormikDatePicker
                    {...OrderBookTabProps[OrderBookTabSelectors.SelectDateSelector]}
                    name={FIELD_NAME_CALENDAR}
                    className={cn(
                        stylePlatformTimeCalendar,
                        'ant-picker-compact-item ant-picker-compact-first-item',
                    )}
                    timeZone={timeZone}
                    showTime
                    showNow
                    size="small"
                />
                <FormikInput
                    {...OrderBookTabProps[OrderBookTabSelectors.NanosecondInput]}
                    name={FIELD_NAME_NANOSECONDS}
                    className={cn(
                        stylePlatformTimeNanoseconds,
                        'ant-input-compact-item ant-input-compact-last-item',
                    )}
                    type="number"
                    step={1}
                    min={0}
                    max={999_999_999}
                    maxLength={9}
                    placeholder="Nanoseconds"
                />
            </FormikForm.Item>
        </>
    );
});
