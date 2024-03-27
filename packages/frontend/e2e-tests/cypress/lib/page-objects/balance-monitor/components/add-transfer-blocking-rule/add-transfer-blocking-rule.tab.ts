import { testSelector } from '@frontend/common/e2e';
import { EAddTransferBlockingRuleTabSelectors } from '@frontend/common/e2e/selectors/balance-monitor/components/add-transfer-blocking-rule/add-transfer-bloking-rule.tab.selectors';
import { ECommonRuleTabSelectors } from '@frontend/common/e2e/selectors/balance-monitor/components/common-rules/common-rule.tab.selectors';

import { Button } from '../../../../base/elements/button';
import { Input } from '../../../../base/elements/input';
import { Selector } from '../../../../base/elements/selector';
import { SelectVirtualList } from '../../../../base/elements/selectVirtualList';
import { Text } from '../../../../base/elements/text';
import { EConfirmModalSelectors } from '../../../common/confirm.modal';

const tabNameInput = [
    'Coin',
    'Source Exchange',
    'Source Account',
    'Destination Exchange',
    'Destination Account',
    'Disabled',
    'Both directions',
    'Alert',
    'Permanent',
    'Notes',
];

class AddTransferBlockingRuleTab {
    readonly addTransferBlockingRuleTab = new Text(
        EAddTransferBlockingRuleTabSelectors.AddTransferBlockingRuleTab,
    );
    readonly coinSelector = new SelectVirtualList(ECommonRuleTabSelectors.CoinSelector);
    readonly accountSelector = new SelectVirtualList(ECommonRuleTabSelectors.AccountSelector);
    readonly exchangeSelector = new SelectVirtualList(ECommonRuleTabSelectors.ExchangeSelector);
    readonly disabledSelector = new Selector(EAddTransferBlockingRuleTabSelectors.DisabledSelector);
    readonly bothDirectionsSwitch = new SelectVirtualList(
        ECommonRuleTabSelectors.BothDirectionsSwitch,
    );
    readonly alertSwitch = new Button(EAddTransferBlockingRuleTabSelectors.AlertSwitch);
    readonly permanentSwitch = new Button(EAddTransferBlockingRuleTabSelectors.PermanentSwitch);
    readonly startPeriodInput = new Input(EAddTransferBlockingRuleTabSelectors.StartTimeInput);
    readonly startTimeSwitch = new Button(EAddTransferBlockingRuleTabSelectors.StartTimeSwitch);
    readonly endPeriodInput = new Input(EAddTransferBlockingRuleTabSelectors.EndTimeInput);
    readonly endTimeSwitch = new Button(EAddTransferBlockingRuleTabSelectors.EndTimeSwitch);
    readonly periodSelector = new SelectVirtualList(
        EAddTransferBlockingRuleTabSelectors.PeriodSelector,
    );
    readonly periodInput = new Input(EAddTransferBlockingRuleTabSelectors.PeriodInput);
    readonly notesInput = new Input(ECommonRuleTabSelectors.NotesInput);
    readonly clearButton = new Button(EAddTransferBlockingRuleTabSelectors.ClearButton);
    readonly createButton = new Button(EAddTransferBlockingRuleTabSelectors.CreateButton);

    checkVisibleTab(): void {
        const selector = testSelector(
            EAddTransferBlockingRuleTabSelectors.AddTransferBlockingRuleTab,
        );
        for (const value of tabNameInput) {
            cy.contains(selector, value);
        }
    }

    checkElementExist(): void {
        const elementsToCheck = [
            this.addTransferBlockingRuleTab,
            this.coinSelector,
            this.exchangeSelector,
            this.disabledSelector,
            this.bothDirectionsSwitch,
            this.alertSwitch,
            this.permanentSwitch,
            this.notesInput,
            this.clearButton,
            this.createButton,
        ];

        elementsToCheck.forEach((element) => element.checkExists());
    }

    clickUpdateButton(): void {
        cy.get(EConfirmModalSelectors.ConfirmModal).within(() => {
            this.createButton.click();
        });
    }
}

export const addTransferBlockingRuleTab = new AddTransferBlockingRuleTab();
