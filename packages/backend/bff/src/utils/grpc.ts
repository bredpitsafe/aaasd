import type { Opaque } from '@common/types';
import Long from 'long';

/**
 * @public
 */
export type TDuration = {
    seconds: number;
    nanos: number;
};

export type TDurationString = Opaque<'DurationString', string>;

/**
 * @public
 */
export function durationToString(duration: TDuration): TDurationString {
    const seconds = duration.seconds;
    const nanos = duration.nanos;
    return Long.fromNumber(seconds)
        .multiply(1_000_000_000)
        .add(nanos)
        .div(1_000)
        .toString() as TDurationString;
}

/**
 * @public
 */
export function stringToDuration(durationString: TDurationString): TDuration {
    const value = durationString.replace(/ms$/, '');
    const seconds = Long.fromString(value).div(1_000_000_000).toNumber();
    const nanos = Long.fromString(value).mod(1_000_000_000).toNumber();
    return {
        seconds,
        nanos,
    };
}
