import type { TAmount, TCoinId } from '@frontend/common/src/types/domain/balanceMonitor/defs';

import type { TRuleCommonFormData } from '../components/defs';

export type TAmountLimitsRuleFormData = TRuleCommonFormData & {
    amountMin?: TAmount;
    amountMax?: TAmount;
    amountCurrency: TCoinId;
    rulePriority: number;
    doNotOverride: boolean;
};
