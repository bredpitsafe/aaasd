import { ECommonRuleTabSelectors } from '@frontend/common/e2e/selectors/balance-monitor/components/common-rules/common-rule.tab.selectors';

import { getDataUpdateRule } from '../../../../../support/data/balance-monitor/getDataUpdatedRule';
import { getUuid } from '../../../../../support/data/random';
import { Button } from '../../../../base/elements/button';
import { Input } from '../../../../base/elements/input';
import { Select } from '../../../../base/elements/select';
import { EConfirmModalSelectors } from '../../../common/confirm.modal';

export enum ERadioButtonType {
    Coin = 0,
    SourceExchange = 1,
    SourceAccount = 2,
    TransitSourceAccount = 3,
    DestinationExchange = 4,
    DestinationAccount = 5,
    TransitDestinationAccount = 6,
}

class CommonRuleTab {
    readonly coinSelector = new Select(ECommonRuleTabSelectors.CoinSelector);
    readonly accountSelector = new Select(ECommonRuleTabSelectors.AccountSelector);
    readonly exchangeSelector = new Select(ECommonRuleTabSelectors.ExchangeSelector);
    readonly notesInput = new Input(ECommonRuleTabSelectors.NotesInput);
    readonly radioButton = new Button(ECommonRuleTabSelectors.RadioButton, false);

    editsRule(): void {
        const data = getDataUpdateRule();
        const random = getUuid();
        cy.get(EConfirmModalSelectors.ConfirmModal).within(() => {
            this.notesInput.clear();
            this.notesInput.type('notes' + random);
        });
        this.coinSelector.typeAndClickByText(data.coinRule);
        this.exchangeSelector.typeAndClickByText(data.destinationExchange);
        cy.wrap('notes' + random).as('notes');
    }

    clickOnRadioButtonByType(index: number) {
        cy.log(index.toString());
        return this.radioButton.get().eq(index).click();
    }
}

export const commonRuleTab = new CommonRuleTab();
