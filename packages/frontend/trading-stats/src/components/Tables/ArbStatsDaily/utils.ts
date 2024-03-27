import type { IAggFuncParams } from '@frontend/ag-grid';
import { max, sum, sumBy } from 'lodash-es';

import type { TArbStatsDailyAsset } from './types';

export enum EAggFuncs {
    Sum = 'sum',
    Max = 'max',
    Avg = 'avg',
    SumExceptRootRow = 'sumExceptRootRow',
    MakerPercentage = 'makerPercentage',
    TakerPercentage = 'takerPercentage',
    Time = 'time',
}
export const aggFuncs = {
    [EAggFuncs.SumExceptRootRow]: (params: IAggFuncParams<TArbStatsDailyAsset>) =>
        params.rowNode.level ? sum(params.values) : max(params.values),
    [EAggFuncs.MakerPercentage]: (params: IAggFuncParams<TArbStatsDailyAsset>) => {
        const makerVolumeUsd = sumBy(params.values, 'makerVolumeUsd');
        const volumeUsdToday = sumBy(params.values, 'volumeUsdToday');

        return {
            makerVolumeUsd,
            volumeUsdToday,
            toString: () => String((makerVolumeUsd! / volumeUsdToday) * 100),
        };
    },
    [EAggFuncs.TakerPercentage]: (params: IAggFuncParams<TArbStatsDailyAsset>) => {
        const takerVolumeUsd = sumBy(params.values, 'takerVolumeUsd');
        const volumeUsdToday = sumBy(params.values, 'volumeUsdToday');

        return {
            takerVolumeUsd,
            volumeUsdToday,
            toString: () => String((takerVolumeUsd! / volumeUsdToday) * 100),
        };
    },
};
