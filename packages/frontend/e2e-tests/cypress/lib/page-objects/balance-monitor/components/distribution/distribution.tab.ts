import { testSelector } from '@frontend/common/e2e';
import { EDistributionTabSelectors } from '@frontend/common/e2e/selectors/balance-monitor/components/distribution/distribution.page.selectors';

import { Select } from '../../../../base/elements/select';
import { Text } from '../../../../base/elements/text';

const tabNameInput = ['Distribution', 'Coin not selected'];

class DistributionTab {
    readonly distributionTab = new Text(EDistributionTabSelectors.DistributionTab);
    readonly coinSelector = new Select(EDistributionTabSelectors.CoinSelector);
    readonly chart = new Text(EDistributionTabSelectors.Chart, false);
    readonly removeCoinButton = new Text(EDistributionTabSelectors.RemoveCoinButton, false);

    checkVisibleTab(): void {
        const selector = testSelector(EDistributionTabSelectors.DistributionTab);
        for (const value of tabNameInput) {
            cy.contains(selector, value);
        }
    }
}

export const distributionTab = new DistributionTab();
