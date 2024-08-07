import { mul } from '@common/utils';

const sec = 1;
const min = sec * 60;
const hour = min * 60;
const day = hour * 24;
const week = day * 7;
const month = day * 30;

export function generatePixelSizes(left: number, right: number): number[] {
    const result = [];

    if (left < sec) {
        result.push(...getDurationsForSecondFraction(left, Math.min(1, right)));
    }

    if (right >= sec && left <= min) {
        result.push(...secondSizes.filter((v) => v >= left && v <= right));
    }

    if (right >= min && left <= hour) {
        result.push(...minutesSizes.map((v) => v * min).filter((v) => v >= left && v <= right));
    }

    if (right >= hour && left <= day) {
        result.push(...hourSizes.map((v) => v * hour).filter((v) => v >= left && v <= right));
    }

    if (right >= day && left <= week) {
        result.push(...daySizes.map((v) => v * day).filter((v) => v >= left && v <= right));
    }

    if (right >= week && left <= month) {
        result.push(...weekSizes.map((v) => v * week).filter((v) => v >= left && v <= right));
    }

    if (right >= month) {
        const fixed = [1, 2, 3, 4, 6, 12];

        result.push(
            ...fixed.map((v) => v * month).filter((v) => v >= left && v <= right),
            ...getDurationsForMonths(month * 12, right),
        );
    }

    return result;
}

function getDurationsForSecondFraction(minDuration: number, maxDuration: number): number[] {
    const result = [];
    let duration = minDuration;

    while (duration < maxDuration) {
        result.push(duration);
        duration = mul(duration, 10);
    }

    return result;
}

const secondSizes = [1, 15, 30];
const minutesSizes = [1, 15, 30];
const hourSizes = [1, 6, 12];
const daySizes = [1];
const weekSizes = [1];

function getDurationsForMonths(minDuration: number, maxDuration: number): number[] {
    const result = [];
    let duration = minDuration;

    while (duration < maxDuration) {
        duration = mul(duration, 2);
        result.push(duration);
    }

    return result;
}
