import type { IAggFuncParams } from '@frontend/ag-grid';
import { isNil, max, sum, sumBy } from 'lodash-es';

import type { TArbStatsDailyAsset, TArbStatsDailyColumnValueWithAggregation } from './types';

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
    [EAggFuncs.SumExceptRootRow]: (
        params: IAggFuncParams<
            TArbStatsDailyAsset,
            TArbStatsDailyColumnValueWithAggregation | null
        >,
    ) => {
        if (
            params.rowNode.level &&
            params.values[0] &&
            params.values.every((v) => isValueWithShouldNotAggregate(v))
        ) {
            const filteredValues = params.values
                .filter(filterShouldNotAggregate)
                .map((val) => (val as TArbStatsDailyColumnValueWithAggregation).value);
            return { value: sum(filteredValues), shouldAggregate: false };
        }
        return params.rowNode.level
            ? { value: sum(params.values.map((v) => v?.value)) }
            : { value: max(params.values.map((v) => v?.value)) };
    },

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

function filterShouldNotAggregate(value: TArbStatsDailyColumnValueWithAggregation | null): boolean {
    return !isNil(value) && 'shouldAggregate' in value && value.shouldAggregate;
}

function isValueWithShouldNotAggregate(
    value: TArbStatsDailyColumnValueWithAggregation | null,
): value is TArbStatsDailyColumnValueWithAggregation {
    if (!value) return false;
    return !isNil(value.value) && !isNil(value.shouldAggregate);
}
