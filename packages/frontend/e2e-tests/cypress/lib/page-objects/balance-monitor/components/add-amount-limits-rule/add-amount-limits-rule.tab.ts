import { testSelector } from '@frontend/common/e2e';
import { EAddAmountLimitsRuleTabSelectors } from '@frontend/common/e2e/selectors/balance-monitor/components/add-amount-limits-rule/add-amount-limits-rule.tab.selectors';
import { ECommonRuleTabSelectors } from '@frontend/common/e2e/selectors/balance-monitor/components/common-rules/common-rule.tab.selectors';

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
    'Amount Currency',
    'Min Amount, USDT',
    'Max Amount, USDT',
    'Notes',
    'Advanced Mode',
];

class AddAmountLimitsRuleTab {
    readonly addAmountLimitsRuleTab = new Text(
        EAddAmountLimitsRuleTabSelectors.AddAmountLimitsRuleTab,
    );
    readonly coinSelector = new Select(ECommonRuleTabSelectors.CoinSelector);
    readonly accountSelector = new Select(ECommonRuleTabSelectors.AccountSelector);
    readonly exchangeSelector = new Select(ECommonRuleTabSelectors.ExchangeSelector);
    readonly notesInput = new Input(ECommonRuleTabSelectors.NotesInput);
    readonly bothDirectionsSwitch = new Select(ECommonRuleTabSelectors.BothDirectionsSwitch);
    readonly amountCurrencyButton = new Text(EAddAmountLimitsRuleTabSelectors.AmountCurrencyButton);
    readonly amountInput = new Input(EAddAmountLimitsRuleTabSelectors.AmountInput);
    readonly rulePriorityInput = new Text(ECommonRuleTabSelectors.RulePriorityInput);
    readonly createButton = new Text(EAddAmountLimitsRuleTabSelectors.CreateButton);
    readonly clearButton = new Text(EAddAmountLimitsRuleTabSelectors.ClearButton);
    readonly doNotOverrideSwitch = new Text(EAddAmountLimitsRuleTabSelectors.DoNotOverrideSwitch);

    checkVisibleTab(): void {
        const selector = testSelector(EAddAmountLimitsRuleTabSelectors.AddAmountLimitsRuleTab);
        for (const value of tabNameInput) {
            cy.contains(selector, value);
        }
    }

    checkElementExist(): void {
        const elementsToCheck = [
            this.addAmountLimitsRuleTab,
            this.coinSelector,
            this.exchangeSelector,
            this.notesInput,
            this.bothDirectionsSwitch,
            this.amountCurrencyButton,
            this.createButton,
            this.clearButton,
        ];

        elementsToCheck.forEach((element) => element.checkExists());
    }

    clickUpdateButton(): void {
        cy.get(EConfirmModalSelectors.ConfirmModal).within(() => {
            this.createButton.click();
        });
    }
}

export const addAmountLimitsRuleTab = new AddAmountLimitsRuleTab();
