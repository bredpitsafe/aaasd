import { testSelector } from '@frontend/common/e2e';
import { EGatheringTabSelectors } from '@frontend/common/e2e/selectors/balance-monitor/components/gathering/gathering.page.selectors';

import { Button } from '../../../../base/elements/button';
import { Input } from '../../../../base/elements/input';
import { SelectVirtualList } from '../../../../base/elements/selectVirtualList';
import { Text } from '../../../../base/elements/text';

const tabNameInput = ['Exchange', 'Coin', 'Available', 'Amount', 'Percent'];

class GatheringTab {
    readonly gatheringTab = new Text(EGatheringTabSelectors.GatheringTab);
    readonly exchangeSelector = new SelectVirtualList(EGatheringTabSelectors.ExchangeSelector);
    readonly coinSelector = new SelectVirtualList(EGatheringTabSelectors.CoinSelector);
    readonly availableInput = new Input(EGatheringTabSelectors.AvailableInput);
    readonly amountInput = new Input(EGatheringTabSelectors.AmountInput);
    readonly percentInput = new Input(EGatheringTabSelectors.PercentInput);
    readonly clearButton = new Button(EGatheringTabSelectors.ClearButton);
    readonly stopCollectingButton = new Button(EGatheringTabSelectors.StopCollectingButton);
    readonly collectButton = new Button(EGatheringTabSelectors.CollectButton);

    checkVisibleTab(): void {
        const selector = testSelector(EGatheringTabSelectors.GatheringTab);
        for (const value of tabNameInput) {
            cy.contains(selector, value);
        }
    }
}

export const gatheringTab = new GatheringTab();
