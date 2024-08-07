import type BaseNanoDate from 'nano-date';

import type { ISO, Microseconds, Milliseconds, Nanoseconds, Seconds } from './time';

export interface INanoDate extends BaseNanoDate {
    toISOString(): ISO;

    toISOStringMilliseconds(): ISO;

    toISOStringMicroseconds(): ISO;

    toISOStringNanoseconds(): ISO;

    secondsOf(): Seconds;

    millisecondsOf(): Milliseconds;

    microsecondsOf(): Microseconds;

    nanosecondsOf(): Nanoseconds;

    isValid(): boolean;
}
