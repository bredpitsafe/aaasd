import { testSelector } from '@frontend/common/e2e';
import { EInternalTransfersTabSelectors } from '@frontend/common/e2e/selectors/balance-monitor/components/internal-transfers/internal-transfers.tab.selectors';

import { Button } from '../../../../base/elements/button';
import { Input } from '../../../../base/elements/input';
import { SelectVirtualList } from '../../../../base/elements/selectVirtualList';
import { Text } from '../../../../base/elements/text';

const tabNameInput = [
    'Exchange / Account',
    'From',
    'From Section',
    'To',
    'To Section',
    'Coin',
    'Available',
    'Amount',
    'Percent',
    'Show balances less then 10$',
];

class InternalTransfersTab {
    readonly internalTransfersTab = new Text(EInternalTransfersTabSelectors.InternalTransfersTab);
    readonly accountSelector = new SelectVirtualList(
        EInternalTransfersTabSelectors.AccountSelector,
    );
    readonly fromToSelector = new SelectVirtualList(EInternalTransfersTabSelectors.FromToSelector);
    readonly fromToSectionSelector = new SelectVirtualList(
        EInternalTransfersTabSelectors.FromToSectionSelector,
    );
    readonly coinSelector = new SelectVirtualList(EInternalTransfersTabSelectors.CoinSelector);
    readonly availableInput = new Input(EInternalTransfersTabSelectors.AvailableInput);
    readonly amountInput = new Input(EInternalTransfersTabSelectors.AmountInput);
    readonly percentInput = new Input(EInternalTransfersTabSelectors.PercentInput);
    readonly balancesSwitch = new Button(EInternalTransfersTabSelectors.BalancesSwitch);
    readonly sendButton = new Button(EInternalTransfersTabSelectors.SendButton);
    readonly clearButton = new Button(EInternalTransfersTabSelectors.ClearButton);

    checkVisibleTab(): void {
        const selector = testSelector(EInternalTransfersTabSelectors.InternalTransfersTab);
        for (const value of tabNameInput) {
            cy.contains(selector, value);
        }
    }
    checkElementExist(): void {
        const elementsToCheck = [
            this.accountSelector,
            this.fromToSelector,
            this.fromToSectionSelector,
            this.coinSelector,
            this.availableInput,
            this.amountInput,
            this.percentInput,
            this.balancesSwitch,
            this.sendButton,
            this.clearButton,
        ];

        elementsToCheck.forEach((element) => element.checkExists());
    }
}

export const internalTransfersTab = new InternalTransfersTab();
