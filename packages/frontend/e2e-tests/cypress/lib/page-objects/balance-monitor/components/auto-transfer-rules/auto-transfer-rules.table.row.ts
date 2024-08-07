import { testSelector } from '@frontend/common/e2e';
import { EAutoTransferRulesTabSelector } from '@frontend/common/e2e/selectors/balance-monitor/components/auto-transfer-rules/auto-transfer-rules.tab.selectors';

import { TableRow } from '../../../common/table/table.row';

class AutoTransferRulesTableRow extends TableRow {
    deleteAllCreatedRows(nameUser: string): void {
        super.deleteAllCreatedRows(
            testSelector(EAutoTransferRulesTabSelector.AutoTransferRulesTab),
            nameUser,
            'Delete Auto Transfer Rule',
        );
    }
}

export const autoTransferRulesTableRow = new AutoTransferRulesTableRow();
