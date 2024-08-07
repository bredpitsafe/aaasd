import type { Assign } from '@common/types';
import type { CalendarDate, TimeZone } from '@common/types';
import { EDateTimeFormats } from '@common/types';
import { getNowDayjs, parseToDayjsInTimeZone } from '@common/utils';
import { isNil } from 'lodash-es';

import type {
    TTradingStatsDailyRouteParams,
    TTradingStatsMonthlyRouteParams,
} from '../modules/router/defs';

export function getTradingStatsDailyFilter(
    timeZone: TimeZone,
    params: TTradingStatsDailyRouteParams,
): Assign<TTradingStatsDailyRouteParams, { date: CalendarDate }> {
    const defaultDate = getNowDayjs(timeZone).format(EDateTimeFormats.Date) as CalendarDate;

    return {
        ...params,
        date: params?.date ?? defaultDate,
    };
}

export function getTradingStatsMonthlyFilter(
    timeZone: TimeZone,
    params: TTradingStatsMonthlyRouteParams,
): Assign<TTradingStatsMonthlyRouteParams, { from: CalendarDate; to: CalendarDate }> {
    let from = isNil(params.from)
        ? getNowDayjs(timeZone).startOf('month')
        : parseToDayjsInTimeZone(params.from, timeZone, EDateTimeFormats.Date);

    let to = isNil(params.to)
        ? getNowDayjs(timeZone)
        : parseToDayjsInTimeZone(params.to, timeZone, EDateTimeFormats.Date);

    if (from.diff(to) > 0) {
        [from, to] = [to, from];
    }

    return {
        ...params,
        from: from.format(EDateTimeFormats.Date) as CalendarDate,
        to: to.format(EDateTimeFormats.Date) as CalendarDate,
    };
}
