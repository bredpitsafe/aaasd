import { testSelector } from '@frontend/common/e2e';
import { ECoinTransferDetailsTabSelectors } from '@frontend/common/e2e/selectors/balance-monitor/components/coin-transfer-details/coin-transfer-details.tab.selectors';

import { Button } from '../../../../base/elements/button';
import { Selector } from '../../../../base/elements/selector';
import { SelectVirtualList } from '../../../../base/elements/selectVirtualList';

const tableTaskNameColumns = [
    'Coin',
    'Source',
    'Destination',
    'Network',
    'Exchange Min',
    'Exchange Max',
    'Account Min',
    'Account Max',
    'Account Max',
    'Reasons',
];

class CoinTransferDetailsTab {
    readonly coinTransferDetailsTab = new Selector(
        ECoinTransferDetailsTabSelectors.CoinTransferDetailsTab,
        false,
    );
    readonly coinTransferFilter = new SelectVirtualList(
        ECoinTransferDetailsTabSelectors.CoinTransferFilter,
    );
    readonly coinRefreshButton = new Button(ECoinTransferDetailsTabSelectors.CoinRefreshButton);

    checkVisibleTable(): void {
        this.coinTransferFilter.checkVisible();
        this.coinRefreshButton.checkVisible();
        const selector = testSelector(ECoinTransferDetailsTabSelectors.CoinTransferDetailsTab);
        for (const value of tableTaskNameColumns) {
            cy.contains(selector, value);
        }
    }
}

export const coinTransferDetailsTab = new CoinTransferDetailsTab();
