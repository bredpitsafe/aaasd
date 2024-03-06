import { testSelector } from '@frontend/common/e2e';
import { ETransfersHistoryTabSelectors } from '@frontend/common/e2e/selectors/balance-monitor/components/transfers-history/transfer-history.tab.selectors';

import { Text } from '../../../../base/elements/text';
const tableTaskNameColumns = [
    'Created',
    'Updated',
    'Status',
    'Coin',
    'Source',
    'Destination',
    'Amount',
    'Tx ID',
    'Explorers',
    'State Message',
    'State Message Raw',
    'Network',
];

class TransfersHistoryTab {
    readonly transfersHistoryTab = new Text(ETransfersHistoryTabSelectors.TransfersHistoryTab);
    checkVisibleTable(): void {
        const selector = testSelector(ETransfersHistoryTabSelectors.TransfersHistoryTab);
        for (const value of tableTaskNameColumns) {
            cy.contains(selector, value);
        }
    }
}

export const transfersHistoryTab = new TransfersHistoryTab();
