import type { Milliseconds, Seconds, Someseconds } from '@frontend/common/src/types/time';
import { mod } from '@frontend/common/src/utils/math';

import { millisecondsToSomeseconds, somesecondsToSeconds } from '../Charter/methods';
import type { TContextState } from '../types';

export function computeSecondsAndSecondFractions(
    ctx: TContextState,
    ...times: Someseconds[]
): [Seconds, Someseconds] {
    const secondInSomesecond = millisecondsToSomeseconds(ctx, 1_000 as Milliseconds);
    let seconds = times.reduce((acc, v: Someseconds) => {
        return acc + Math.trunc(somesecondsToSeconds(ctx, v));
    }, 0);
    let sumSecondFraction = Math.trunc(
        times.reduce((acc, v: Someseconds) => {
            return acc + mod(v, secondInSomesecond);
        }, 0),
    );

    while (sumSecondFraction < 0) {
        sumSecondFraction += secondInSomesecond;
        seconds -= 1;
    }

    while (sumSecondFraction > secondInSomesecond) {
        sumSecondFraction -= secondInSomesecond;
        seconds += 1;
    }

    return [seconds as Seconds, sumSecondFraction as Someseconds];
}
