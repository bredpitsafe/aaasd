import type {
    CalendarDate,
    Hours,
    ISO,
    Microseconds,
    Milliseconds,
    Minutes,
    Nanoseconds,
    Seconds,
    Someseconds,
    TDateTimeLike,
    TimeZone,
    TSomeDateType,
    TTimeZoneInfo,
} from '@common/types';
import { EDateTimeFormats, TimeZoneList } from '@common/types';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat.js';
import timezone from 'dayjs/plugin/timezone.js';
import utc from 'dayjs/plugin/utc.js';
import { isEmpty, isNil } from 'lodash-es';

import { div, mul } from './math.ts';
import { NanoDate } from './NanoDate.ts';

const { isDayjs } = dayjs;
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(customParseFormat);

export const secondInMilliseconds = 1000 as Milliseconds;
export const minuteInMilliseconds = (60 * secondInMilliseconds) as Milliseconds;
export const hourInMilliseconds = (60 * minuteInMilliseconds) as Milliseconds;
export const dayInMilliseconds = (24 * hourInMilliseconds) as Milliseconds;
export const weekInMilliseconds = (7 * dayInMilliseconds) as Milliseconds;
export const monthInMilliseconds = (30 * dayInMilliseconds) as Milliseconds;

/**
 * @deprecated Use settings timezone
 */
export const timeZoneOffsetMinutes: Minutes = new Date().getTimezoneOffset() as Minutes;
/**
 * @deprecated Use settings timezone
 */
export const timeZoneOffsetMilliseconds: Milliseconds = minutes2milliseconds(timeZoneOffsetMinutes);

export function toSomeseconds(v: number): Someseconds {
    return v as Someseconds;
}

export function toNanoseconds(v: number): Nanoseconds {
    return v as Nanoseconds;
}
export function toMilliseconds(v: number): Milliseconds {
    return v as Milliseconds;
}

export function toSeconds(v: number): Seconds {
    return v as Seconds;
}

export function isISO(str: unknown): str is ISO {
    return (
        typeof str === 'string' &&
        // @ts-ignore - TS doesn't know that Date is a valid input for isNaN,
        // if result equal Invalid Date then isNaN(date) returns true
        !isNaN(new Date(str))
    );
}

export function seconds2milliseconds<R extends Milliseconds>(v: Seconds): R {
    return mul(v, 1000);
}

export function seconds2nanoseconds<R extends Nanoseconds>(v: Seconds): R {
    return mul(v, 1e9);
}

export function milliseconds2seconds<R extends Seconds>(v: Milliseconds): R {
    return div(v, 1000);
}

export function milliseconds2hours<R extends Hours>(v: Milliseconds): R {
    return div(v, 1000 * 60 * 60);
}

export function minutes2milliseconds<R extends Milliseconds>(mins: Minutes): R {
    return mul(mins, 60 * 1000);
}

export function hours2milliseconds<R extends Milliseconds>(hours: Hours): R {
    return mul(hours, 60 * 60 * 1000);
}

export function milliseconds2microseconds<R extends Microseconds>(ms: Milliseconds): R {
    return mul(ms, 1e3);
}

export function microseconds2nanoseconds<R extends Nanoseconds>(ms: Microseconds): R {
    return <R>(ms * 1e3);
}

export function nanoseconds2microseconds<R extends Microseconds>(ms: Nanoseconds): R {
    return <R>(ms / 1e3);
}

export function milliseconds2nanoseconds<R extends Nanoseconds>(ms: Milliseconds): R {
    return <R>(ms * 1e6);
}

export function nanoseconds2milliseconds<R extends Milliseconds>(ms: Nanoseconds): R {
    return <R>(ms / 1e6);
}

export function seconds2minutes<R extends Minutes>(seconds: Seconds): R {
    return div<Seconds, number, R>(seconds, 60);
}

export function minutes2hours<R extends Hours>(mins: Minutes): R {
    return div<Minutes, number, R>(mins, 60);
}

export function hours2minutes<R extends Minutes>(mins: Hours): R {
    return mul<Hours, number, R>(mins, 60);
}

export const iso2NanoDate = (iso: ISO): NanoDate => new NanoDate(iso);

export const milliseconds2iso = (ms: Milliseconds) => new Date(ms).toISOString() as ISO;

export function iso2milliseconds(iso: ISO) {
    return iso2NanoDate(iso).millisecondsOf();
}

export const nanoseconds2iso = (ns: Nanoseconds) =>
    new NanoDate(String(ns)).toISOStringNanoseconds();

export function iso2nanoseconds<R extends Nanoseconds>(iso: ISO): R {
    return <R>iso2NanoDate(iso).nanosecondsOf();
}

export function toISO(v: Dayjs | TSomeDateType): ISO {
    if (isISO(v)) return v;
    if (isDayjs(v)) return v.toISOString() as ISO;
    if (v instanceof Date) return v.toISOString() as ISO;
    if (v instanceof NanoDate) return v.toISOString() as ISO;
    if (typeof v === 'number') return milliseconds2iso(v as Milliseconds);

    throw new Error(`Can't convert ${v} to ISO`);
}

export function getNowISO(): ISO {
    return new Date().toISOString() as ISO;
}

export function getNowDayjs(timeZone: TimeZone): Dayjs {
    return toDayjsWithTimezone(Date.now() as Milliseconds, timeZone);
}

export function getNowMilliseconds(): Milliseconds {
    return <Milliseconds>Date.now();
}

export function getNowNanoseconds(): Nanoseconds {
    return milliseconds2nanoseconds(getNowMilliseconds());
}

export function formatNanoDate(
    date: NanoDate,
    format: EDateTimeFormats,
    timeZone: TimeZone,
): string {
    const modifiedFormat = format
        .replaceAll('SSSSSSSSS', 'SSS_1__2_')
        .replaceAll('SSSSSS', 'SSS_1_');

    const partialFormat = toDayjsWithTimezone(date.toISOString(), timeZone).format(modifiedFormat);

    return partialFormat
        .replaceAll('_1_', padDateTimePart(date.getMicroseconds()))
        .replaceAll('_2_', padDateTimePart(date.getNanoseconds()));
}

function padDateTimePart(value: number, size = 3) {
    return value.toFixed(0).padStart(size, '0');
}

export function parse(timestamp: string, format: EDateTimeFormats): Dayjs | undefined {
    const value = dayjs(timestamp, format, true);
    return value.isValid() ? value : undefined;
}

export function isUnixTimestamp(value: string): boolean {
    return /^\d{13}$/.test(value);
}

export function isDateTimeLike(value: string): value is TDateTimeLike {
    if (isEmpty(value)) {
        return false;
    }

    const match = value.match(
        /^(\d{4})-(\d{2})-(\d{2})(?:\s|T)(\d{2}):(\d{2}):(\d{2})(?:\.\d{0,9})?Z?$/,
    );

    // Match should contain 6 date parts (year, month, day hours, minutes, seconds) + 1 full string match
    if (isNil(match) || match.length !== 7) {
        return false;
    }

    const years = parseInt(match[1], 10);
    const monthIndex = parseInt(match[2], 10) - 1;
    const days = parseInt(match[3], 10);
    const hours = parseInt(match[4], 10);
    const minutes = parseInt(match[5], 10);
    const seconds = parseInt(match[6], 10);

    const date = new Date(years, monthIndex, days, hours, minutes, seconds);

    return (
        date.getFullYear() === years &&
        date.getMonth() === monthIndex &&
        date.getDate() === days &&
        date.getHours() === hours &&
        date.getMinutes() === minutes &&
        date.getSeconds() === seconds
    );
}

export function parseDateTimeLike(value: TDateTimeLike, timeZone: TimeZone): NanoDate | undefined {
    const utcDate = `${value.substring(0, 10)}T${value.substring(11)}` as ISO;
    const wasInUTC = utcDate.endsWith('Z');
    if (wasInUTC) {
        const date = iso2NanoDate(utcDate);
        return date.isValid() ? date : undefined;
    }

    const date = iso2NanoDate(`${utcDate}Z` as ISO);
    if (!date.isValid()) {
        return undefined;
    }

    const utcOffset = parseToDayjsInTimeZone(utcDate, timeZone).utcOffset();
    date.setUTCMinutes(date.getUTCMinutes() - utcOffset);

    return date;
}

export function getPlatformTimeValues(value: string, timeZone: TimeZone): undefined | NanoDate {
    if (isEmpty(value)) {
        return;
    }

    if (isUnixTimestamp(value)) {
        return new NanoDate(parseInt(value, 10) as Milliseconds);
    }

    if (isDateTimeLike(value)) {
        return parseDateTimeLike(value, timeZone);
    }
}

export function getCurrentUtcOffset(): Minutes {
    return dayjs().utcOffset() as Minutes;
}

export function getTimeZoneCurrentUtcOffset(timeZone: TimeZone): Minutes {
    return dayjs().utc().tz(timeZone).utcOffset() as Minutes;
}

export function getTimeZoneUtcOffset(
    dateOrIso: dayjs.ConfigType | ISO | CalendarDate,
    timeZone: TimeZone,
): Minutes {
    const date = dayjs.isDayjs(dateOrIso) ? dateOrIso : dayjs(dateOrIso);
    return date.tz(timeZone).utcOffset() as Minutes;
}

export function guessCurrentTimeZone(): TimeZone {
    return dayjs.tz.guess() as TimeZone;
}

export function getTimeZoneFullName({ timeZone, utcOffset }: TTimeZoneInfo): string {
    const wholeHours = Math.trunc(minutes2hours(utcOffset)) as Hours;
    const restMinutes = (utcOffset - hours2minutes(wholeHours)) as Minutes;
    const sign = Math.sign(utcOffset);

    return `(UTC${sign >= 0 ? '+' : '-'}${wholeHours.toString().padStart(2, '0')}:${restMinutes
        .toString()
        .padStart(2, '0')}) ${timeZone}`;
}

export function getGuessedTimeZoneInfo(): TTimeZoneInfo {
    return timeZone2TimeZoneInfo(guessCurrentTimeZone(), true);
}

export function getUtcTimeZoneInfo(): TTimeZoneInfo {
    return timeZone2TimeZoneInfo(TimeZoneList.UTC);
}

export function timeZone2TimeZoneInfo(timeZone: TimeZone, guessLocal = false): TTimeZoneInfo {
    return {
        timeZone,
        utcOffset: getTimeZoneCurrentUtcOffset(timeZone),
        guessLocal,
    };
}

export function toDayjsWithTimezone(
    dateOrIso: Date | Dayjs | ISO | Milliseconds,
    timeZone: TimeZone,
): Dayjs {
    const date = dayjs.isDayjs(dateOrIso) ? dateOrIso : dayjs(dateOrIso);
    // TODO: Need additional investigation when cloning dayjs object with tz double offset is applied, can't
    // simplify to "date.tz(timeZone)"
    return date.utc().utcOffset(date.tz(timeZone).utcOffset());
}

export function parseToDayjsInTimeZone(
    value: string,
    timeZone: TimeZone,
    format?: string | string[],
    strict?: boolean,
): Dayjs {
    const date = dayjs(value, format, strict);

    if (!date.isValid()) {
        return date;
    }

    return toDayjsWithTimezone(
        dayjs.tz(date.format(EDateTimeFormats.DateTimeMilliseconds), timeZone),
        timeZone,
    );
}
