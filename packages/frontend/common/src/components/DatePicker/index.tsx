import type { TimeZone } from '@common/types';
import { parseToDayjsInTimeZone, toDayjsWithTimezone } from '@common/utils';
import type { PickerProps } from 'antd/es/date-picker/generatePicker';
import type { Dayjs } from 'dayjs';
import { isEmpty, isNil } from 'lodash-es';
import { useMemo } from 'react';

import { useFunction } from '../../utils/React/useFunction';
import { datePickerWithTimeZoneBuilder } from './utils';

export type TDatePickerProps = PickerProps<Dayjs> & {
    timeZone: TimeZone;
    showTime?: boolean;
};

export function DatePicker(props: TDatePickerProps) {
    const value = useMemo<undefined | Dayjs>(
        () => (isNil(props.value) ? undefined : toDayjsWithTimezone(props.value, props.timeZone)),
        [props.value, props.timeZone],
    );

    const defaultValue = useMemo<undefined | Dayjs>(
        () =>
            isNil(props.defaultValue)
                ? undefined
                : toDayjsWithTimezone(props.defaultValue, props.timeZone),
        [props.defaultValue, props.timeZone],
    );

    const handleChange = useFunction((date: null | Dayjs, dateString: string) => {
        props.onChange?.(date?.utc() ?? null, dateString);
    });

    const cbSetDate = useFunction((dateString: string) => {
        if (isEmpty(dateString)) {
            props.onChange?.(null, dateString);
        } else {
            const date = parseToDayjsInTimeZone(dateString, props.timeZone);
            props.onChange?.(date.isValid() ? date.utc() : value ?? null, dateString);
        }
    });

    const handleKeyDown = useFunction((e) => {
        const { key } = e;
        const target = e.target as HTMLInputElement;
        const { value } = target;
        if (key === 'Enter' || key === 'Escape') {
            cbSetDate(value);
        }
    });

    const handleBlur = useFunction((e) => {
        const target = e.target as HTMLInputElement;
        const { value } = target;
        cbSetDate(value);
        props.onBlur?.(e);
    });

    const DatePickerWithTimeZone = datePickerWithTimeZoneBuilder(props.timeZone);

    return (
        <DatePickerWithTimeZone
            {...props}
            value={value}
            defaultValue={defaultValue}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onBlur={handleBlur}
        />
    );
}
