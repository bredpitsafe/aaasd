import type { Milliseconds } from '@common/types';
import type { ERuleGroups } from '@frontend/common/src/types/domain/balanceMonitor/defs';

import type { TRuleCommonFormData } from '../components/defs';

export type TTransferBlockingRuleFormData = TRuleCommonFormData & {
    showAlert: boolean;
    isPermanent: boolean;
    disabledGroups: ERuleGroups.All | ERuleGroups.Suggest | ERuleGroups.Manual;
    startImmediately: boolean;
    startTime?: Milliseconds;
    selectEndDate: boolean;
    endTime?: Milliseconds;
    periodValue?: number;
    periodUnit: 'hours' | 'days';
};
