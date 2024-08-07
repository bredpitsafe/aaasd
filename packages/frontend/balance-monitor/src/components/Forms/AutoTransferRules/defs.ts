import type { TRuleCommonFormData } from '../components/defs';

export type TAutoTransferRuleFormData = TRuleCommonFormData & {
    enableAuto: boolean;
    rulePriority: number;
};
