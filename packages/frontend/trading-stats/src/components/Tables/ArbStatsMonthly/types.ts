import { TAsset } from '@frontend/common/src/types/domain/asset';
import { TExchange } from '@frontend/common/src/types/domain/exchange';
import { TAmountUSD, TBalanceStatDaily } from '@frontend/common/src/types/domain/tradingStats';

import { EArbStatsBreakdownType } from '../ArbStatsDaily/types';

export type TArbMonthlyStrategy = {
    key: string;
    strategy: TBalanceStatDaily['strategy'];
    breakdown: EArbStatsBreakdownType;
    name: TAsset['name'] | TExchange['name'];
    values: Record<string, TArbMonthlyValue>;
    total: TArbMonthlyValue;
};

export type TArbMonthlyValue = TAmountUSD;
