import type { IAggFuncParams } from '@frontend/ag-grid';
import { isNil, sum } from 'lodash-es';

import type { TBalancePnlDailyAsset } from './types';

export enum EAggFuncs {
    IsDeltaUsdApproximate = 'isDeltaUsdApproximate',
    SumExceptEmpty = 'sumExceptEmpty',
}

export const aggFuncs = {
    [EAggFuncs.SumExceptEmpty]: (params: IAggFuncParams<TBalancePnlDailyAsset>) =>
        params.values.some(isNil) ? null : sum(params.values),
    [EAggFuncs.IsDeltaUsdApproximate]: (params: IAggFuncParams<TBalancePnlDailyAsset>) =>
        params.values.some((v) => v === true),
};
