import { usdFormatter } from '@frontend/common/src/components/AgTable/formatters/usd';
import { ValueFormatterFunc } from 'ag-grid-community';
import { sprintf } from 'sprintf-js';

import { TArbStatsDailyAsset } from '../types';

const usdFormatterFn = usdFormatter(false);
export const feeFormatter: ValueFormatterFunc<TArbStatsDailyAsset> = (params) => {
    const fee = params.data?.fees?.[0];
    const feeStr = fee ? sprintf('(%.2f %s)', fee.value, fee.assetName) : '';
    return `${usdFormatterFn(params)} ${feeStr}`;
};
