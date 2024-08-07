import { testSelector } from '@frontend/common/e2e';
import { EAmountLimitsRulesTabSelector } from '@frontend/common/e2e/selectors/balance-monitor/components/amount-limits-rules/amount-limits-rules.tab.selectors';

import { TableRow } from '../../../common/table/table.row';

class AmountLimitsRulesTableRow extends TableRow {
    deleteAllCreatedRows(nameUser: string): void {
        super.deleteAllCreatedRows(
            testSelector(EAmountLimitsRulesTabSelector.AmountLimitsRulesTab),
            nameUser,
            'Delete Amount Limits Rule',
        );
    }
}

export const amountLimitsRulesTableRow = new AmountLimitsRulesTableRow();
