import type { TAmountUSD, TBalanceStatDaily } from '@frontend/common/src/types/domain/tradingStats';

type TBalancePnlMonthlyProfit = {
    date: string;
    profit: TAmountUSD;
    isApproximateProfit: boolean;
};

export type TBalancePnlMonthly = {
    name: TBalanceStatDaily['strategy'];
    profit: TAmountUSD;
    isApproximateProfit: boolean;
    profits: Record<string, TBalancePnlMonthlyProfit>;
};
