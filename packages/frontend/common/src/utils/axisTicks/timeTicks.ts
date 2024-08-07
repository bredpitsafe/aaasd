import type { Milliseconds } from '@common/types';
import {
    dayInMilliseconds,
    div,
    hourInMilliseconds,
    minuteInMilliseconds,
    secondInMilliseconds,
    sum,
    weekInMilliseconds,
} from '@common/utils';

import { numberTicks } from './numberTicks';
import {
    isLessThanDay,
    isLessThanHour,
    isLessThanMinute,
    isLessThanSecond,
    isLessThanWeek,
} from './utils';

export function timeTicks(start: Milliseconds, stop: Milliseconds, count: number): Milliseconds[] {
    start = Math.floor(start) as Milliseconds;
    stop = Math.ceil(stop) as Milliseconds;

    const duration = sum(stop, -start);
    const dirtyStep = div(duration, count);

    if (isLessThanSecond(dirtyStep)) {
        return numberTicks(start, stop, count) as Milliseconds[];
    }

    if (isLessThanMinute(dirtyStep)) {
        return generateTicks(start, stop, getClosestValue(dirtyStep, stepsForSeconds));
    }
    if (isLessThanHour(dirtyStep)) {
        return generateTicks(start, stop, getClosestValue(dirtyStep, stepsForMinutes));
    }
    if (isLessThanDay(dirtyStep)) {
        return generateTicks(start, stop, getClosestValue(dirtyStep, stepsForHours));
    }
    if (isLessThanWeek(dirtyStep)) {
        return generateTicks(start, stop, getClosestValue(dirtyStep, stepsForDays));
    }

    return generateTicks(start, stop, dirtyStep - (dirtyStep % weekInMilliseconds));
}

function getClosestValue(v: number, set: number[]): number {
    let result = 0;
    let diff = Infinity;
    let nextDiff = Infinity;

    for (let i = 0; i < set.length; i++) {
        nextDiff = Math.abs(set[i] - v);

        if (nextDiff > diff) {
            return result;
        }

        result = set[i];
        diff = nextDiff;
    }

    return result;
}

function generateTicks<T extends number>(start: T, stop: T, step: number): T[] {
    let current = Math.sign(start) * step + start - (start % step);
    const result = [];

    while (current < stop) {
        result.push(current);
        current += step;
    }

    return result as T[];
}

const stepsFor60 = [1, 5, 10, 15, 20, 30];
const stepsFor24 = [1, 2, 3, 4, 6, 8, 12];
const stepsFor30 = [1, 5, 10, 15];
const stepsForSeconds = stepsFor60.map((v) => v * secondInMilliseconds);
const stepsForMinutes = stepsFor60.map((v) => v * minuteInMilliseconds);
const stepsForHours = stepsFor24.map((v) => v * hourInMilliseconds);
const stepsForDays = stepsFor30.map((v) => v * dayInMilliseconds);
