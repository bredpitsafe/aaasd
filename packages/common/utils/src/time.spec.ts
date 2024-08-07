import type { Nanoseconds, Seconds, TimeZone } from '@common/types';
import { EDateTimeFormats } from '@common/types';

import { NanoDate } from './NanoDate.ts';
import { formatNanoDate } from './time.ts';

describe('NanoDate formatter', () => {
    it('Format with DateTimeNanoseconds UTC', () => {
        const date = NanoDate.from({
            unixSeconds: 1681201136 as Seconds,
            nanoseconds: 3456789 as Nanoseconds,
        });
        expect(
            formatNanoDate(date, EDateTimeFormats.DateTimeNanoseconds, 'UTC' as TimeZone),
        ).toEqual('2023-04-11 08:18:56.003456789');
    });

    it('Format with DateTimeMicroseconds UTC', () => {
        const date = NanoDate.from({
            unixSeconds: 1681201136 as Seconds,
            nanoseconds: 3456789 as Nanoseconds,
        });
        expect(
            formatNanoDate(date, EDateTimeFormats.DateTimeMicroseconds, 'UTC' as TimeZone),
        ).toEqual('2023-04-11 08:18:56.003456');
    });

    it('Format with SubSecondPart UTC', () => {
        const date = NanoDate.from({
            unixSeconds: 1681201136 as Seconds,
            nanoseconds: 3456789 as Nanoseconds,
        });
        expect(formatNanoDate(date, EDateTimeFormats.SubSecondPart, 'UTC' as TimeZone)).toEqual(
            '003456789',
        );
    });

    it('Format with DateTimeNanoseconds Europe/Warsaw W/O DST', () => {
        const date = NanoDate.from({
            // 2022-01-01T10:20:30.000Z
            unixSeconds: 1641032430 as Seconds,
            nanoseconds: 3456789 as Nanoseconds,
        });
        expect(
            formatNanoDate(date, EDateTimeFormats.DateTimeNanoseconds, 'Europe/Warsaw' as TimeZone),
        ).toEqual('2022-01-01 11:20:30.003456789');
    });

    it('Format with DateTimeMicroseconds Europe/Warsaw W/O DST', () => {
        const date = NanoDate.from({
            // 2022-01-01T10:20:30.000Z
            unixSeconds: 1641032430 as Seconds,
            nanoseconds: 3456789 as Nanoseconds,
        });
        expect(
            formatNanoDate(
                date,
                EDateTimeFormats.DateTimeMicroseconds,
                'Europe/Warsaw' as TimeZone,
            ),
        ).toEqual('2022-01-01 11:20:30.003456');
    });

    it('Format with SubSecondPart Europe/Warsaw W/O DST', () => {
        const date = NanoDate.from({
            // 2022-01-01T10:20:30.000Z
            unixSeconds: 1641032430 as Seconds,
            nanoseconds: 3456789 as Nanoseconds,
        });
        expect(
            formatNanoDate(date, EDateTimeFormats.SubSecondPart, 'Europe/Warsaw' as TimeZone),
        ).toEqual('003456789');
    });

    it('Format with DateTimeNanoseconds Europe/Warsaw DST', () => {
        const date = NanoDate.from({
            // '2022-08-01T10:20:30.000Z'
            unixSeconds: 1659349230 as Seconds,
            nanoseconds: 3456789 as Nanoseconds,
        });
        expect(
            formatNanoDate(date, EDateTimeFormats.DateTimeNanoseconds, 'Europe/Warsaw' as TimeZone),
        ).toEqual('2022-08-01 12:20:30.003456789');
    });

    it('Format with DateTimeMicroseconds Europe/Warsaw DST', () => {
        const date = NanoDate.from({
            // '2022-08-01T10:20:30.000Z'
            unixSeconds: 1659349230 as Seconds,
            nanoseconds: 3456789 as Nanoseconds,
        });
        expect(
            formatNanoDate(
                date,
                EDateTimeFormats.DateTimeMicroseconds,
                'Europe/Warsaw' as TimeZone,
            ),
        ).toEqual('2022-08-01 12:20:30.003456');
    });

    it('Format with SubSecondPart Europe/Warsaw DST', () => {
        const date = NanoDate.from({
            // '2022-08-01T10:20:30.000Z'
            unixSeconds: 1659349230 as Seconds,
            nanoseconds: 3456789 as Nanoseconds,
        });
        expect(
            formatNanoDate(date, EDateTimeFormats.SubSecondPart, 'Europe/Warsaw' as TimeZone),
        ).toEqual('003456789');
    });
});
