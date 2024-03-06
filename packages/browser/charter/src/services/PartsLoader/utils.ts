import { Someseconds } from '@frontend/common/src/types/time';
import { assert } from '@frontend/common/src/utils/assert';

import { TPartInterval } from '../../../lib/Parts/def';

export function assetCorrectInterval(
    interval: [Someseconds, Someseconds],
    pixelSize: Someseconds,
): interval is TPartInterval {
    assert(interval[0] < interval[1], `Time start bigger than time end`);
    assert(interval[0] % pixelSize === 0, `Time start no around`);
    assert(interval[1] % pixelSize === 0, `Time end no around`);

    return true;
}
