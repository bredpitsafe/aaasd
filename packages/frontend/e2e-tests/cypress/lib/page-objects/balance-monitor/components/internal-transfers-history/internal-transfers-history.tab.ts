import { testSelector } from '@frontend/common/e2e';
import { EInternalTransfersHistoryTabSelectors } from '@frontend/common/e2e/selectors/balance-monitor/components/internal-transfers-history/internal-transfers-history.tab.selectors';

import { Text } from '../../../../base/elements/text';

const tableTaskNameColumns = [
    'Created',
    'Status',
    'Coin',
    'Main Account',
    'Source',
    'Destination',
    'Amount',
    'Transfer ID',
    'State Message',
];

class InternalTransfersHistoryTab {
    readonly internalTransfersHistoryTab = new Text(
        EInternalTransfersHistoryTabSelectors.InternalTransfersHistoryTab,
    );

    checkVisibleTable(): void {
        const selector = testSelector(
            EInternalTransfersHistoryTabSelectors.InternalTransfersHistoryTab,
        );
        for (const value of tableTaskNameColumns) {
            cy.contains(selector, value);
        }
    }
}

export const internalTransfersHistoryTab = new InternalTransfersHistoryTab();
