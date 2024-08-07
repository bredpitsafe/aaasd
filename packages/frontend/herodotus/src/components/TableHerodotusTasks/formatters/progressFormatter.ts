import type { ValueFormatterParams } from '@frontend/ag-grid';
import { formatNumber } from '@frontend/common/src/utils/formatNumber/formatNumber';
import { toFixed } from '@frontend/common/src/utils/toFixed';

import type { THerodotusTaskView } from '../../../types';

export const progressFormatter = (params: ValueFormatterParams<THerodotusTaskView>): string => {
    if (params.data === undefined) {
        return '';
    }

    const progress = toFixed(params.value, 2);
    const filled = formatNumber(toFixed(params.data.filledAmount ?? 0, 3), {
        maximumFractionDigits: 3,
    });
    const target = formatNumber(toFixed(params.data.amountView ?? 0, 3), {
        maximumFractionDigits: 3,
    });

    return `${progress}% [${filled} / ${target}]`;
};
