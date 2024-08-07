import { testSelector } from '@frontend/common/e2e';
import { ETransferBlockingRulesTabSelector } from '@frontend/common/e2e/selectors/balance-monitor/components/transfer-blocking-rules/transfer-blocking-rules.tab.selectors';

import { Text } from '../../../../base/elements/text';

const tableTaskNameColumns = [
    'ID',
    'Created',
    'Updated',
    'User Name',
    'Status',
    'Coin',
    'Source Exchange',
    'Source Account',
    'Destination Exchange',
    'Destination Account',
    'Both directions',
    'Show Alert',
    'Disabled',
    'Since',
    'Until',
    'Note',
];

class TransferBlockingRulesTab {
    readonly transferBlockingRulesTab = new Text(
        ETransferBlockingRulesTabSelector.TransferBlockingRulesTab,
    );

    checkVisibleTable(): void {
        const selector = testSelector(ETransferBlockingRulesTabSelector.TransferBlockingRulesTab);
        for (const value of tableTaskNameColumns) {
            cy.contains(selector, value);
        }
    }
}

export const transferBlockingRulesTab = new TransferBlockingRulesTab();
