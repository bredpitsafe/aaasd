import { testSelector } from '@frontend/common/e2e';
import { ECoinTransferDetailsTabSelectors } from '@frontend/common/e2e/selectors/balance-monitor/components/coin-transfer-details/coin-transfer-details.tab.selectors';

import { Button } from '../../../../base/elements/button';
import { Select } from '../../../../base/elements/select';
import { Text } from '../../../../base/elements/text';

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
    readonly coinTransferDetailsTab = new Text(
        ECoinTransferDetailsTabSelectors.CoinTransferDetailsTab,
        false,
    );
    readonly coinTransferFilter = new Select(ECoinTransferDetailsTabSelectors.CoinTransferFilter);
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
