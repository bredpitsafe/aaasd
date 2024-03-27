import { FastForwardOutlined } from '@ant-design/icons';
import { ENavType } from '@frontend/common/src/actors/Settings/types';
import { Button } from '@frontend/common/src/components/Button';
import { DatePicker } from '@frontend/common/src/components/DatePicker';
import { FloatButton } from '@frontend/common/src/components/FloatButton';
import type { Milliseconds, Seconds, TimeZone } from '@frontend/common/src/types/time';
import { getNowMilliseconds, seconds2milliseconds } from '@frontend/common/src/utils/time';
import type { Dayjs } from 'dayjs';
import { ReactElement, useCallback } from 'react';

type TFocusToTimeViewProps = {
    timeZone: TimeZone;
    type: ENavType;
    collapsed: boolean;
    disabled?: boolean;
    onChange: (time: Milliseconds) => void;
};

const TOOLTIP = 'Focus to now';

export function DateTimePicker({
    timeZone,
    collapsed,
    type,
    disabled,
    onChange,
}: TFocusToTimeViewProps): ReactElement {
    const cbDatePicker = useCallback(
        (dayjs: Dayjs | null) => {
            if (dayjs && typeof dayjs.unix === 'function') {
                onChange(seconds2milliseconds(dayjs.unix() as Seconds));
            }
        },
        [onChange],
    );
    const cbToLive = useCallback(() => onChange(getNowMilliseconds()), [onChange]);
    const icon = collapsed ? <FastForwardOutlined /> : null;

    return (
        <>
            {!collapsed && <DatePicker timeZone={timeZone} onChange={cbDatePicker} showTime />}
            {type === ENavType.Hidden ? (
                !disabled && <FloatButton tooltip={TOOLTIP} icon={icon} onClick={cbToLive} />
            ) : (
                <Button title={TOOLTIP} icon={icon} disabled={disabled} onClick={cbToLive}>
                    {!collapsed && 'Now'}
                </Button>
            )}
        </>
    );
}
