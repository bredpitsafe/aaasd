import type { Milliseconds } from '@common/types';
import { getNowMilliseconds, sum } from '@common/utils';
import { isUndefined } from 'lodash-es';
import { map } from 'rxjs/operators';

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
