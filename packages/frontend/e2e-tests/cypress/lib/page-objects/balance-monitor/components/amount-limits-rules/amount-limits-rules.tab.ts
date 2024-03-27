import { testSelector } from '@frontend/common/e2e';
import { EAmountLimitsRulesTabSelector } from '@frontend/common/e2e/selectors/balance-monitor/components/amount-limits-rules/amount-limits-rules.tab.selectors';

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
    'Amount Min',
    'Amount Max',
    'Amount currency',
    'Note',
];

class AmountLimitsRulesTab {
    readonly amountLimitsRulesTab = new Text(EAmountLimitsRulesTabSelector.AmountLimitsRulesTab);

    checkVisibleTable(): void {
        const selector = testSelector(EAmountLimitsRulesTabSelector.AmountLimitsRulesTab);
        for (const value of tableTaskNameColumns) {
            cy.contains(selector, value);
        }
    }

    checkElementExist(): void {
        this.amountLimitsRulesTab.checkExists();
    }
}

export const amountLimitsRulesTab = new AmountLimitsRulesTab();
