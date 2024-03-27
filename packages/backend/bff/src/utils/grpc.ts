import { Opaque } from '@backend/utils/src/util-types.ts';
import Long from 'long';

/**
 * @public
 */
export type TDuration = {
    seconds: string;
    nanos: number;
};

export type TDurationString = Opaque<'DurationString', string>;

/**
 * @public
 */
export function durationToString(duration: TDuration): TDurationString {
    const seconds = duration.seconds;
    const nanos = duration.nanos;
    return Long.fromString(seconds)
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
    const seconds = Long.fromString(value).div(1_000_000_000).toString();
    const nanos = Long.fromString(value).mod(1_000_000_000).toNumber();
    return {
        seconds,
        nanos,
    };
}
