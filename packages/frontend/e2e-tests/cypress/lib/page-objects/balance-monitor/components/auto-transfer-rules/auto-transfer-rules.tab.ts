import { testSelector } from '@frontend/common/e2e';
import { EAutoTransferRulesTabSelector } from '@frontend/common/e2e/selectors/balance-monitor/components/auto-transfer-rules/auto-transfer-rules.tab.selectors';

import { Text } from '../../../../base/elements/text';

const tableTaskNameColumns = [
    'ID',
    'Created',
    'Updated',
    'User Name',
    'Coin',
    'Source Exchange',
    'Source Account',
    'Destination Exchange',
    'Destination Account',
    'Both directions',
    'Enable Auto',
    'Note',
];

class AutoTransferRulesTab {
    readonly autoTransferRulesTab = new Text(EAutoTransferRulesTabSelector.AutoTransferRulesTab);

    checkVisibleTable(): void {
        const selector = testSelector(EAutoTransferRulesTabSelector.AutoTransferRulesTab);
        for (const value of tableTaskNameColumns) {
            cy.contains(selector, value);
        }
    }

    checkElementExist(): void {
        this.autoTransferRulesTab.checkExists();
    }
}

export const autoTransferRulesTab = new AutoTransferRulesTab();
