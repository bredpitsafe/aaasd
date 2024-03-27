import * as dayjs from 'dayjs';
import * as utcPlugin from 'dayjs/plugin/utc';

import { ETime } from '../../lib/page-objects/common/time';

dayjs.extend(utcPlugin);
export function dateChange(typeTime: ETime): string {
    let date = dayjs().utc();

    switch (typeTime) {
        case ETime.Hour:
            date = date.subtract(1, 'hour');
            break;
        case ETime.SixHours:
            date = date.subtract(6, 'hour');
            break;
        case ETime.HalfDay:
            date = date.subtract(12, 'hour');
            break;
        case ETime.Day:
            date = date.subtract(1, 'day');
            break;
        case ETime.Week:
            date = date.subtract(7, 'day');
            break;
        case ETime.Month:
            date = date.subtract(1, 'month');
            break;
    }
    return date.format('YYYY-MM-DD HH');
}

export function previousDayFromDate(dateStr: string): string {
    const date = dayjs(dateStr).subtract(1, 'day');
    return date.format('YYYY-MM-DD');
}

export function getDateOnly(typeTime: ETime): string {
    const dateTime = dateChange(typeTime);
    const date = dayjs(dateTime);
    return date.format('YYYY-MM-DD');
}

export function getFirstDayOfMonth(offset = 0): string {
    const date = dayjs().add(offset, 'month');
    return date.startOf('month').format('YYYY-MM-DD');
}

export function getLastDayOfMonth(offset = 0): string {
    const date = dayjs().add(offset, 'month');
    return date.endOf('month').format('YYYY-MM-DD');
}
