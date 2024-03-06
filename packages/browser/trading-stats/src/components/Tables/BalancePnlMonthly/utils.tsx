import { EMPTY_ARRAY } from '@frontend/common/src/utils/const';
import { isUndefined, uniq } from 'lodash-es';

import type { TBalancePnlMonthly } from './types';

export function getAllDates(data?: TBalancePnlMonthly[]): string[] {
    if (isUndefined(data)) {
        return EMPTY_ARRAY;
    }

    return data
        .reduce((acc: string[], { profits }) => uniq(acc.concat(Object.keys(profits))), [])
        .sort();
}
