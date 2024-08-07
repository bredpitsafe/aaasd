import type { Milliseconds, Nanoseconds, Seconds } from '@common/types';

import { NanoDate } from './NanoDate.ts';
import { milliseconds2microseconds, milliseconds2nanoseconds } from './time.ts';

describe('NanoDate', () => {
    const timestamp = 1680177016420 as Milliseconds;
    const iso = '2023-03-30T11:50:16.420Z';

    it('microseconds', () => {
        const mc = 123;
        const date = new NanoDate(iso);

        date.setMicroseconds(mc);

        expect(date.getMicroseconds()).toEqual(mc);
        expect(date.microsecondsOf()).toEqual(milliseconds2microseconds(timestamp) + mc);
        expect(date.toISOStringMicroseconds()).toEqual('2023-03-30T11:50:16.420123Z');
    });

    it('nanoseconds', () => {
        const ns = 456;
        const date = new NanoDate(iso);

        date.setNanoseconds(ns);

        expect(date.getNanoseconds()).toEqual(ns);
        expect(date.nanosecondsOf()).toEqual(milliseconds2nanoseconds(timestamp) + ns);
        expect(date.toISOStringNanoseconds()).toEqual('2023-03-30T11:50:16.420000456Z');
    });

    it('millisecondsOf', () => {
        const date = new NanoDate('1970-01-01T00:00:00.123456789Z');
        expect(date.millisecondsOf()).toEqual(123);
    });

    it('microsecondsOf', () => {
        const date = new NanoDate('1970-01-01T00:00:00.123456789Z');
        expect(date.microsecondsOf()).toEqual(123456);
    });

    it('nanosecondsOf', () => {
        const date = new NanoDate('1970-01-01T00:00:00.123456789Z');
        expect(date.nanosecondsOf()).toEqual(123456789);
    });

    it('NanoDate.from', () => {
        const date = NanoDate.from({
            unixSeconds: 1681201136 as Seconds,
            nanoseconds: 123456789 as Nanoseconds,
        });
        expect(date.toISOStringNanoseconds()).toEqual('2023-04-11T08:18:56.123456789Z');
    });
});
