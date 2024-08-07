import type { Opaque } from '../utils';
import type { INanoDate } from './INanoDate';

export type Someseconds = Opaque<'Someseconds', number>;

export type Nanoseconds = Opaque<'Nanoseconds', number>;
export type Microseconds = Opaque<'Microseconds', number>;
export type Milliseconds = Opaque<'Milliseconds', number>;
export type Seconds = Opaque<'Seconds', number>;
export type Minutes = Opaque<'Minutes', number>;
export type Hours = Opaque<'Hours', number>;
export type Days = Opaque<'Days', number>;
export type Weeks = Opaque<'Weeks', number>;
export type Timestamp = Milliseconds;
export type TimeZone = Opaque<'TimeZone', string>;
export type CalendarDate = Opaque<'CalendarDate', string>;

// https://www.rfc-editor.org/rfc/rfc3339
export type ISO = Opaque<'ISO', string>;

export type TSomeDateType = Milliseconds | ISO | Date | INanoDate;

export type TDateTimeLike = Opaque<'DateTimeLike', string>;

export type TTimeZoneInfo = {
    timeZone: TimeZone;
    utcOffset: Minutes;
    guessLocal: boolean;
};

export enum EDateTimeFormats {
    Date = 'YYYY-MM-DD',
    MonthDay = 'MMM DD',
    Month = 'YYYY-MM',
    MonthYear = 'MMM YY',
    DateTime = 'YYYY-MM-DD HH:mm:ss',
    DateTimeMilliseconds = 'YYYY-MM-DD HH:mm:ss.SSS',
    DateTimeMicroseconds = 'YYYY-MM-DD HH:mm:ss.SSSSSS',
    DateTimeNanoseconds = 'YYYY-MM-DD HH:mm:ss.SSSSSSSSS',
    Time = 'HH:mm:ss',
    TimeMilliseconds = 'HH:mm:ss.SSS',
    SubSecondPart = 'SSSSSSSSS',
}

export const TimeZoneList = {
    UTC: 'UTC' as TimeZone,
    EuropeMoscow: 'Europe/Moscow' as TimeZone,
};
