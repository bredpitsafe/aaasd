import type { Someseconds } from '@common/types';

import type { TNormalizedPartInterval, TPart, TPartInterval } from '../../lib/Parts/def';
import {
    getMaxTimeEnd,
    getMinTimeStart,
    getMissedIntervalsBetweenParts,
} from '../../lib/Parts/utils/point';
import { assetCorrectInterval } from '../services/PartsLoader/utils';

export function normalizeInterval(
    interval: TPartInterval,
    duration: Someseconds,
): TNormalizedPartInterval {
    return [
        normalizeToLeft(interval[0], duration),
        normalizeToRight(interval[1], duration),
    ] as TNormalizedPartInterval;
}

function normalizeToLeft(value: Someseconds, duration: Someseconds): Someseconds {
    const timeStart = Math.floor(value);

    return <Someseconds>(timeStart % duration === 0
        ? timeStart
        : // don't change order computations, it's affects on pricion result
          (timeStart > 0 ? 0 : -duration) + (timeStart - (timeStart % duration)));
}

function normalizeToRight(value: Someseconds, duration: Someseconds): Someseconds {
    const timeEnd = Math.floor(value);
    return <Someseconds>(timeEnd % duration === 0
        ? timeEnd
        : // don't change order computations, it's affects on pricion result
          (timeEnd < 0 ? 0 : duration) + (timeEnd - (timeEnd % duration)));
}

export function getMissedIntervals<T extends TPartInterval>(interval: T, parts: TPart[]): T[] {
    if (parts.length === 0) {
        return [interval];
    }

    const minTime = getMinTimeStart(parts);
    const maxTime = getMaxTimeEnd(parts);
    const missedIntervals: T[] = [];

    if (interval[0] < minTime) {
        missedIntervals.push(<T>[interval[0], minTime]);
    }

    missedIntervals.push(...(getMissedIntervalsBetweenParts(parts) as T[]));

    if (interval[1] > maxTime) {
        missedIntervals.push(<T>[maxTime, interval[1]]);
    }

    missedIntervals.forEach((interval) => {
        assetCorrectInterval(interval, parts[0].pixelSize);
    });

    return missedIntervals;
}
