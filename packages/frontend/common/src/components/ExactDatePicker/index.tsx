import type { ISO, Seconds, TimeZone } from '@common/types';
import { EDateTimeFormats } from '@common/types';
import { formatNanoDate, getPlatformTimeValues, NanoDate } from '@common/utils';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import { isEmpty, isNil } from 'lodash-es';
import type { ChangeEvent, InputHTMLAttributes, ReactElement } from 'react';
import { useEffect, useMemo, useState } from 'react';

import {
    ETableTabFilterProps,
    ETableTabFilterSelectors,
} from '../../../e2e/selectors/table-tab.filter.selectors';
import type { TWithClassname } from '../../types/components';
import { useFunction } from '../../utils/React/useFunction';
import type { TDatePickerProps } from '../DatePicker';
import { DatePicker } from '../DatePicker';
import { Input } from '../Input';

type TExactDatePickerProps = TWithClassname &
    Omit<TDatePickerProps, 'value' | 'onChange'> & {
        value: ISO | undefined;
        displayFormat?: EDateTimeFormats;
        timeZone: TimeZone;
        onChange: (value: ISO | undefined) => void;
    };

export function ExactDatePicker(props: TExactDatePickerProps): ReactElement {
    const {
        value,
        displayFormat = EDateTimeFormats.DateTimeMilliseconds,
        timeZone,
        onChange,
        size,
    } = props;

    const [displayedString, setDisplayedString] = useState<string | undefined>(undefined);
    const [nanoDate, setNanoDate] = useState<NanoDate | undefined>(undefined);
    const [isError, setIsError] = useState<boolean>(false);

    const cbChange = useFunction((newValue: NanoDate | undefined) => {
        if (newValue?.toISOStringMilliseconds() !== nanoDate?.toISOStringMilliseconds()) {
            onChange(newValue?.toISOStringNanoseconds());
        }
    });

    // When uses presses `Enter` in the input, try to parse whatever value there is currently
    const cbSubmitCustomInput = useFunction(() => {
        setIsError(false);

        if (isEmpty(displayedString)) {
            return cbChange(undefined);
        }
        const newDate = getPlatformTimeValues(displayedString!, timeZone);
        if (isNil(newDate)) {
            setIsError(true);
            return;
        }

        setDisplayedString(formatNanoDate(newDate, displayFormat, timeZone));
        cbChange(newDate);
    });

    // When user selects date from the calendar,
    // we should create a new NanoDate from it with 0 milliseconds
    const cbSetDate = useFunction((date: Dayjs | null) => {
        setIsError(false);

        if (isNil(date)) {
            setNanoDate(undefined);
            setDisplayedString(undefined);
            cbChange(undefined);
            return;
        }

        const unixSeconds = date.unix() as Seconds;
        const newDate = NanoDate.from({
            unixSeconds,
        });
        setNanoDate(newDate);
        setDisplayedString(formatNanoDate(newDate, displayFormat, timeZone));
        cbChange(newDate);
    });

    // If value from props changes, we should update `nanoDate`
    useEffect(() => {
        setIsError(false);

        if (isNil(value)) {
            setNanoDate(undefined);
            setDisplayedString(undefined);
            return;
        }

        const newDate = new NanoDate(value);

        if (isNil(newDate)) {
            setNanoDate(undefined);
            setDisplayedString(undefined);
            return;
        }

        setNanoDate(newDate);
        setDisplayedString(formatNanoDate(newDate, displayFormat, timeZone));
    }, [displayFormat, timeZone, value]);

    const milliseconds = nanoDate?.valueOf();
    const dayjsValue = useMemo(
        () => (milliseconds ? dayjs(milliseconds) : undefined),
        [milliseconds],
    );

    const cbInputChange = useFunction((e: ChangeEvent<HTMLInputElement>) =>
        setDisplayedString(e.target.value),
    );

    const cbBlur = useFunction(() => {
        setDisplayedString(
            isNil(nanoDate) ? undefined : formatNanoDate(nanoDate, displayFormat, timeZone),
        );
    });

    const cbInputRender = useFunction((props: InputHTMLAttributes<HTMLInputElement>) => {
        return (
            <Input
                {...ETableTabFilterProps[ETableTabFilterSelectors.DataInput]}
                // @ts-ignore
                ref={props.ref}
                placeholder={props.placeholder}
                onFocus={props.onFocus}
                onMouseDown={props.onMouseDown}
                onChange={cbInputChange}
                onPressEnter={cbSubmitCustomInput}
                onBlur={cbBlur}
                size={size ?? 'small'}
                value={displayedString}
                title={displayedString}
            />
        );
    });

    return (
        <DatePicker
            size={size ?? 'small'}
            inputRender={cbInputRender}
            className={props.className}
            showTime
            value={dayjsValue}
            onChange={cbSetDate}
            status={isError ? 'error' : undefined}
            timeZone={props.timeZone}
        />
    );
}
