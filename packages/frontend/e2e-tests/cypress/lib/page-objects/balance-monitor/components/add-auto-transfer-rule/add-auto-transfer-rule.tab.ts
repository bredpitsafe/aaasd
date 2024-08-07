import { testSelector } from '@frontend/common/e2e';
import { EAddAutoTransferRuleSelectors } from '@frontend/common/e2e/selectors/balance-monitor/components/add-auto-transfer-rule/add-auto-transfer-rule.tab.selectors';
import { ECommonRuleTabSelectors } from '@frontend/common/e2e/selectors/balance-monitor/components/common-rules/common-rule.tab.selectors';

import { Button } from '../../../../base/elements/button';
import { Input } from '../../../../base/elements/input';
import { Select } from '../../../../base/elements/select';
import { Text } from '../../../../base/elements/text';
import { EConfirmModalSelectors } from '../../../common/confirm.modal';

const tabNameInput = [
    'Coin',
    'Source Exchange',
    'Source Account',
    'Destination Exchange',
    'Destination Account',
    'Both directions',
    'Auto Transfer',
    'Notes',
    'Advanced Mode',
];

class AddAutoTransferRuleTab {
    readonly addAutoTransferRuleTab = new Text(
        EAddAutoTransferRuleSelectors.AddAutoTransferRuleTab,
    );
    readonly coinSelector = new Select(ECommonRuleTabSelectors.CoinSelector);
    readonly accountSelector = new Select(ECommonRuleTabSelectors.AccountSelector);
    readonly exchangeSelector = new Select(ECommonRuleTabSelectors.ExchangeSelector);
    readonly notesInput = new Input(ECommonRuleTabSelectors.NotesInput);
    readonly rulePriorityInput = new Input(ECommonRuleTabSelectors.RulePriorityInput);
    readonly bothDirectionsSwitch = new Select(ECommonRuleTabSelectors.BothDirectionsSwitch);
    readonly autoTransferSwitch = new Button(EAddAutoTransferRuleSelectors.AutoTransferSwitch);
    readonly clearButton = new Button(EAddAutoTransferRuleSelectors.ClearButton);
    readonly createButton = new Button(EAddAutoTransferRuleSelectors.CreateButton);

    checkVisibleTab(): void {
        const selector = testSelector(EAddAutoTransferRuleSelectors.AddAutoTransferRuleTab);
        for (const value of tabNameInput) {
            cy.contains(selector, value);
        }
    }

    checkElementExist(): void {
        const elementsToCheck = [
            this.addAutoTransferRuleTab,
            this.coinSelector,
            this.exchangeSelector,
            this.notesInput,
            this.bothDirectionsSwitch,
            this.autoTransferSwitch,
        ];

        elementsToCheck.forEach((element) => element.checkExists());
    }

    clickUpdateButton(): void {
        cy.get(EConfirmModalSelectors.ConfirmModal).within(() => {
            this.createButton.click();
        });
    }
}

export const addAutoTransferRuleTab = new AddAutoTransferRuleTab();
