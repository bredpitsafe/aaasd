import { testSelector } from '@frontend/common/e2e';
import { EAddTaskTabSelectors } from '@frontend/common/e2e/selectors/trading-servers-manager/components/add-task-tab/add-task.tab.selectors';

import { Button } from '../../../../base/elements/button';
import { Input } from '../../../../base/elements/input';
import { SelectVirtualList } from '../../../../base/elements/selectVirtualList';
import { Text } from '../../../../base/elements/text';

class AddTaskTab {
    readonly addTaskTab = new SelectVirtualList(EAddTaskTabSelectors.AddTaskTab);
    readonly taskTypeSelector = new SelectVirtualList(EAddTaskTabSelectors.TaskTypeSelector);
    readonly baseAssetSelector = new SelectVirtualList(EAddTaskTabSelectors.BaseAssetSelector);
    readonly totalAmountInput = new Input(EAddTaskTabSelectors.TotalAmountInput);
    readonly totalAmountLabel = new Input(EAddTaskTabSelectors.TotalAmountLabel);
    readonly exchangeSelector = new SelectVirtualList(EAddTaskTabSelectors.ExchangeSelector);
    readonly accountSelector = new SelectVirtualList(EAddTaskTabSelectors.AccountSelector);
    readonly instrumentSelector = new SelectVirtualList(EAddTaskTabSelectors.InstrumentSelector);
    readonly instrumentLabel = new SelectVirtualList(EAddTaskTabSelectors.InstrumentLabel);
    readonly instrumentRoleSelector = new SelectVirtualList(
        EAddTaskTabSelectors.InstrumentRoleSelector,
    );
    readonly deleteInstrumentButton = new Button(EAddTaskTabSelectors.DeleteInstrumentButton);
    readonly selectInstrumentButton = new Button(EAddTaskTabSelectors.SelectInstrumentButton);
    readonly addInstrumentButton = new Button(EAddTaskTabSelectors.AddInstrumentButton);
    readonly orderAmountInput = new Input(EAddTaskTabSelectors.OrderAmountInput);
    readonly orderAmountLabel = new Input(EAddTaskTabSelectors.OrderAmountLabel);
    readonly currencyType = new SelectVirtualList(EAddTaskTabSelectors.CurrencyType);
    readonly maxPremiumInput = new Input(EAddTaskTabSelectors.MaxPremiumInput);
    readonly maxPriceInput = new Input(EAddTaskTabSelectors.MaxPriceInput);
    readonly maxPriceLabel = new Text(EAddTaskTabSelectors.MaxPriceLabel);
    readonly aggressionInput = new Input(EAddTaskTabSelectors.AggressionInput);
    readonly addTaskFormButton = new Button(EAddTaskTabSelectors.AddTaskFormButton);
    readonly resetFormButton = new Button(EAddTaskTabSelectors.ResetFormButton);
    readonly buyInstrumentsForm = new Text(EAddTaskTabSelectors.BuyInstrumentsForm);
    readonly sellInstrumentsForm = new Text(EAddTaskTabSelectors.SellInstrumentsForm);
    readonly resetPriceToCurrent = new Text(EAddTaskTabSelectors.ResetPriceToCurrent);

    checkElementsExists(): void {
        this.taskTypeSelector.checkExists();
        this.addTaskFormButton.checkExists();
        this.resetFormButton.checkExists();
    }

    setBuyInstruments(exchangeType: string, accountType: string, instrumentType: string) {
        cy.get(testSelector(EAddTaskTabSelectors.BuyInstrumentsForm)).within(() => {
            this.exchangeSelector.clickAndType(exchangeType);
            this.accountSelector.clickAndType(accountType);
            this.instrumentSelector.clickAndType(instrumentType);
        });
    }

    setSellInstruments(exchangeType: string, accountType: string, instrumentType: string) {
        cy.get(testSelector(EAddTaskTabSelectors.SellInstrumentsForm)).within(() => {
            this.exchangeSelector.clickAndType(exchangeType);
            this.accountSelector.clickAndType(accountType);
            this.instrumentSelector.clickAndType(instrumentType);
        });
    }

    setSecondInstruments(exchangeType: string, accountType: string, instrumentType: string) {
        this.exchangeSelector.clickAndType(exchangeType);
        this.accountSelector.clickAndType(accountType);
        this.instrumentSelector.clickAndType(instrumentType);
    }

    checkVisibleInstrumentLabel() {
        const selector = testSelector(EAddTaskTabSelectors.InstrumentLabel);
        for (const value of [
            'Order Amount',
            'Amount Multiplier',
            'Max Order Amount',
            'Amount Step',
        ]) {
            cy.contains(selector, value);
        }
    }

    addBuyAndSellInstruments() {
        cy.get(testSelector(EAddTaskTabSelectors.AddInstrumentButton)).first().click();
        cy.get(testSelector(EAddTaskTabSelectors.AddInstrumentButton)).last().click();
    }

    addBuyInstruments() {
        cy.get(testSelector(EAddTaskTabSelectors.AddInstrumentButton)).first().click();
    }

    addSellInstruments() {
        cy.get(testSelector(EAddTaskTabSelectors.AddInstrumentButton)).last().click();
    }

    getMaxPriceValue(): void {
        cy.get(testSelector(EAddTaskTabSelectors.MaxPriceInput))
            .first()
            .invoke('val')
            .then((date) => {
                cy.wrap(date).as('maxPrice');
            });
    }

    checkContainMaxPriceValue(): void {
        cy.get('@maxPrice').then((object) => {
            const maxPrice = String(object).replace(/,/g, '');
            cy.get(testSelector(EAddTaskTabSelectors.TotalAmountLabel)).contains(maxPrice);
        });
    }
}

export const addTaskTab = new AddTaskTab();
