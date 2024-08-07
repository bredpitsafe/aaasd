import { testSelector } from '@frontend/common/e2e';
import { ESuggestedTransfersTabSelectors } from '@frontend/common/e2e/selectors/balance-monitor/components/suggested-transfers/suggested-transfers.tab.selectors';

import { Text } from '../../../../base/elements/text';
import { ETableHeaderSelectors } from '../../../common/table/table.header';
import { tableRow } from '../../../common/table/table.row';

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

const nameCoins = ['AAA', 'CAA', 'WBN', 'XXX', 'ZZZ', 'YYY'];

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

    checkContainAllCoins() {
        const selector = testSelector(ESuggestedTransfersTabSelectors.SuggestedTransfersTab);
        for (const value of nameCoins) {
            cy.contains(selector, value);
        }
    }

    checkContainCoin(nameCoin: string) {
        cy.get(testSelector(ESuggestedTransfersTabSelectors.SuggestedTransfersTab)).within(() => {
            tableRow.checkContainCoin(nameCoin);
            cy.get(ETableHeaderSelectors.TableHeaderText).contains('Coin').click();
            tableRow.checkContainCoin(nameCoin);
        });
    }

    clicksCoin(nameCoin: string) {
        cy.get(testSelector(ESuggestedTransfersTabSelectors.SuggestedTransfersTab)).within(() => {
            tableRow.coinRowText.firstContainsClick(nameCoin);
        });
    }
}

export const suggestedTransfersTab = new SuggestedTransfersTab();
