import { testSelector } from '@frontend/common/e2e';
import { ETransferBlockingRulesTabSelector } from '@frontend/common/e2e/selectors/balance-monitor/components/transfer-blocking-rules/transfer-blocking-rules.tab.selectors';

import { TableRow } from '../../../common/table/table.row';

class TransferBlockingRulesTableRow extends TableRow {
    deleteAllCreatedRows(nameUser: string): void {
        super.deleteAllCreatedRows(
            testSelector(ETransferBlockingRulesTabSelector.TransferBlockingRulesTab),
            nameUser,
            'Delete Transfer Blocking Rule',
        );
    }
}

export const transferBlockingRulesTableRow = new TransferBlockingRulesTableRow();
