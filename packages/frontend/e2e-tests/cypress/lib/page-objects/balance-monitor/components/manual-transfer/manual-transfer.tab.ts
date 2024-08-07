import { testSelector } from '@frontend/common/e2e';
import { EManualTransferTabSelectors } from '@frontend/common/e2e/selectors/balance-monitor/components/manual-transfer/manual-transfer.tab.selectors';

import { Input } from '../../../../base/elements/input';
import { Select } from '../../../../base/elements/select';
import { Text } from '../../../../base/elements/text';

const tabNameInput = ['Coin', 'Source', 'Destination', 'Available', 'Amount', 'Percent'];

class ManualTransferTab {
    readonly manualTransferTab = new Text(EManualTransferTabSelectors.ManualTransferTab);
    readonly coinSelector = new Select(EManualTransferTabSelectors.CoinSelector);
    readonly sourceSelector = new Select(EManualTransferTabSelectors.SourceSelector);
    readonly destinationSelector = new Select(EManualTransferTabSelectors.DestinationSelector);
    readonly availableSelector = new Select(EManualTransferTabSelectors.AvailableSelector);
    readonly amountInput = new Input(EManualTransferTabSelectors.AmountInput);
    readonly percentInput = new Input(EManualTransferTabSelectors.PercentInput);
    readonly clearButton = new Input(EManualTransferTabSelectors.ClearButton);
    readonly sendButton = new Input(EManualTransferTabSelectors.SendButton);
    readonly warningIconButton = new Input(EManualTransferTabSelectors.WarningIconButton, false);

    checkVisibleTab(): void {
        const selector = testSelector(EManualTransferTabSelectors.ManualTransferTab);
        for (const value of tabNameInput) {
            cy.contains(selector, value);
        }
    }

    clickSendButton() {
        cy.get(testSelector(EManualTransferTabSelectors.ManualTransferTab)).within(() =>
            this.sendButton.click(),
        );
    }

    clickClearButton() {
        cy.get(testSelector(EManualTransferTabSelectors.ManualTransferTab)).within(() =>
            this.clearButton.click(),
        );
    }
}

export const manualTransferTab = new ManualTransferTab();
