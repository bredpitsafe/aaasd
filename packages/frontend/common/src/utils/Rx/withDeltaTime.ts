import { isUndefined } from 'lodash-es';
import { map } from 'rxjs/operators';

import { Milliseconds } from '../../types/time';
import { sum } from '../math';
import { getNowMilliseconds } from '../time';

export function withDeltaTime<T>() {
    let prev: Milliseconds | undefined;
    return map<T, [T, Milliseconds]>((value, index) => {
        // On restart pipe
        if (index === 0) {
            prev = undefined;
        }

        const now = getNowMilliseconds();
        const delta = isUndefined(prev) ? Infinity : sum(now, -prev);
        prev = now;

        return [value, delta] as [T, Milliseconds];
    });
}
