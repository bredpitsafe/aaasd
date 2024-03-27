import { testSelector } from '@frontend/common/e2e';
import { ETransfersHistoryTabSelectors } from '@frontend/common/e2e/selectors/balance-monitor/components/transfers-history/transfer-history.tab.selectors';

import { Text } from '../../../../base/elements/text';
import { TableContextMenu } from '../../../common/table/table.context-menu';
import { ETableHeaderSelectors } from '../../../common/table/table.header';
import { tableRow } from '../../../common/table/table.row';
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

class TransfersHistoryTab extends TableContextMenu {
    readonly transfersHistoryTab = new Text(ETransfersHistoryTabSelectors.TransfersHistoryTab);
    readonly transfersHistoryFilter = new Text(
        ETransfersHistoryTabSelectors.TransfersHistoryFilter,
        false,
    );
    checkVisibleTable(): void {
        const selector = testSelector(ETransfersHistoryTabSelectors.TransfersHistoryTab);
        for (const value of tableTaskNameColumns) {
            cy.contains(selector, value);
        }
    }

    checkContainAllCoins() {
        cy.get(ETransfersHistoryTabSelectors.TransfersHistoryFilter).eq(3).click();
        this.headerMenu.contains('WBN');
        this.headerMenu.contains('AAA');
    }

    checkContainCoin(nameCoin: string) {
        cy.get(testSelector(ETransfersHistoryTabSelectors.TransfersHistoryTab)).within(() => {
            tableRow.checkContainCoin(nameCoin);
            cy.get(ETableHeaderSelectors.TableHeaderText).contains('Coin').click();
            tableRow.checkContainCoin(nameCoin);
        });
    }

    clicksCoin(nameCoin: string) {
        cy.get(testSelector(ETransfersHistoryTabSelectors.TransfersHistoryTab)).within(() => {
            tableRow.coinRowText.firstContainsClick(nameCoin);
        });
    }
}

export const transfersHistoryTab = new TransfersHistoryTab();
