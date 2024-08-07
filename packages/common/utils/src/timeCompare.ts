import type { Microseconds, Milliseconds, Nanoseconds, TSomeDateType } from '@common/types';

import { NanoDate } from './NanoDate.ts';
import { microseconds2nanoseconds, milliseconds2nanoseconds } from './time.ts';

export function sumDates(a: TSomeDateType, b: TSomeDateType): NanoDate {
    const aMilli = getTotalMilliseconds(a);
    const bMilli = getTotalMilliseconds(b);
    const sumMilli = aMilli + bMilli;

    const date = new NanoDate(sumMilli);

    date.setMicroseconds(getMicroseconds(a) + getMicroseconds(b));
    date.setNanoseconds(getNanoseconds(a) + getNanoseconds(b));

    return date;
}

export function diffDatesInNanoseconds(a: TSomeDateType, b: TSomeDateType): Nanoseconds {
    const aMilli = getTotalMilliseconds(a);
    const bMilli = getTotalMilliseconds(b);
    const difMilli = aMilli - bMilli;

    const aMicro = getMicroseconds(a);
    const bMicro = getMicroseconds(b);
    const difMicro = aMicro - bMicro;

    const aNano = getNanoseconds(a);
    const bNano = getNanoseconds(b);
    const difNano = aNano - bNano;

    return (milliseconds2nanoseconds(difMilli as Milliseconds) +
        microseconds2nanoseconds(difMicro as Microseconds) +
        difNano) as Nanoseconds;
}

export function compareDates(a: TSomeDateType, b: TSomeDateType): number {
    if (typeof a === 'string' && typeof b === 'string' && a.length === b.length) {
        return a.localeCompare(b);
    }
    if (typeof a === 'number' && typeof b === 'number') {
        return Math.sign(a - b);
    }
    if (a instanceof Date && b instanceof Date) {
        return Math.sign(a.getTime() - b.getTime());
    }

    const aMilli = getTotalMilliseconds(a);
    const bMilli = getTotalMilliseconds(b);
    const diffMilli = aMilli - bMilli;

    if (diffMilli !== 0) return Math.sign(diffMilli);

    const aMicro = getMicroseconds(a);
    const bMicro = getMicroseconds(b);
    const diffMicro = aMicro - bMicro;

    if (diffMicro !== 0) return Math.sign(diffMicro);

    const aNano = getNanoseconds(a);
    const bNano = getNanoseconds(b);
    const diffNano = aNano - bNano;

    return diffNano === 0 ? 0 : Math.sign(diffNano);
}

export function isClampedDates(
    point: TSomeDateType,
    from: TSomeDateType,
    to: TSomeDateType,
): boolean {
    return compareDates(from, point) <= 0 && compareDates(point, to) <= 0;
}

export function minDate<A extends TSomeDateType, B extends TSomeDateType>(a: A, b: B): A | B {
    return compareDates(a, b) <= 0 ? a : b;
}

export function maxDate<A extends TSomeDateType, B extends TSomeDateType>(a: A, b: B): A | B {
    return compareDates(a, b) <= 0 ? b : a;
}

export function isEqualDates(a: TSomeDateType, b: TSomeDateType): boolean {
    return compareDates(a, b) === 0;
}

function getTotalMilliseconds(date: TSomeDateType) {
    if (typeof date === 'number') return date;
    if (typeof date === 'string') return new Date(date).getTime();
    return date instanceof Date ? date.getTime() : date.valueOf();
}

function getMicroseconds(date: TSomeDateType) {
    if (typeof date === 'number') return 0;
    if (typeof date === 'string') return date.length < 26 ? 0 : Number(date.substring(23, 26));
    return date instanceof Date ? 0 : date.getMicroseconds();
}

function getNanoseconds(date: TSomeDateType) {
    if (typeof date === 'number') return 0;
    if (typeof date === 'string') return date.length < 29 ? 0 : Number(date.substring(26, 29));
    return date instanceof Date ? 0 : date.getNanoseconds();
}
