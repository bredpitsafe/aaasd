import { testSelector } from '@frontend/common/e2e';
import { ESuggestedTransfersTabSelectors } from '@frontend/common/e2e/selectors/balance-monitor/components/suggested-transfers/suggested-transfers.tab.selectors';

import { Text } from '../../../../base/elements/text';

const tableTaskNameColumns = [
    'Status',
    'Coin',
    'Source',
    'Destination',
    'Available',
    'Transfer Amount',
    'Account / Exchange',
    'Markup',
];

class SuggestedTransfersTab {
    readonly suggestedTransfersTab = new Text(
        ESuggestedTransfersTabSelectors.SuggestedTransfersTab,
    );
    readonly sendButton = new Text(ESuggestedTransfersTabSelectors.SendButton);
    readonly resetButton = new Text(ESuggestedTransfersTabSelectors.ResetButton);

    checkVisibleTable(): void {
        const selector = testSelector(ESuggestedTransfersTabSelectors.SuggestedTransfersTab);
        for (const value of tableTaskNameColumns) {
            cy.contains(selector, value);
        }
    }

    checkProgressIndicators() {
        this.suggestedTransfersTab.contains('New');
        this.suggestedTransfersTab.contains('In Progress');
    }
}

export const suggestedTransfersTab = new SuggestedTransfersTab();
