import { testSelector } from '@frontend/common/e2e';
import { EAddTaskTabSelectors } from '@frontend/common/e2e/selectors/trading-servers-manager/components/add-task-tab/add-task.tab.selectors';

import { Button } from '../../../../base/elements/button';
import { Input } from '../../../../base/elements/input';
import { Select } from '../../../../base/elements/select';
import { Text } from '../../../../base/elements/text';

class AddTaskTab {
    readonly addTaskTab = new Select(EAddTaskTabSelectors.AddTaskTab);
    readonly taskTypeSelector = new Select(EAddTaskTabSelectors.TaskTypeSelector);
    readonly baseAssetSelector = new Select(EAddTaskTabSelectors.BaseAssetSelector);
    readonly totalAmountInput = new Input(EAddTaskTabSelectors.TotalAmountInput);
    readonly totalAmountLabel = new Input(EAddTaskTabSelectors.TotalAmountLabel);
    readonly exchangeSelector = new Select(EAddTaskTabSelectors.ExchangeSelector);
    readonly accountSelector = new Select(EAddTaskTabSelectors.AccountSelector);
    readonly instrumentSelector = new Select(EAddTaskTabSelectors.InstrumentSelector);
    readonly instrumentLabel = new Select(EAddTaskTabSelectors.InstrumentLabel);
    readonly instrumentRoleSelector = new Select(EAddTaskTabSelectors.InstrumentRoleSelector);
    readonly deleteInstrumentButton = new Button(EAddTaskTabSelectors.DeleteInstrumentButton);
    readonly selectInstrumentButton = new Button(EAddTaskTabSelectors.SelectInstrumentButton);
    readonly addInstrumentButton = new Button(EAddTaskTabSelectors.AddInstrumentButton);
    readonly orderAmountInput = new Input(EAddTaskTabSelectors.OrderAmountInput);
    readonly orderAmountLabel = new Input(EAddTaskTabSelectors.OrderAmountLabel);
    readonly currencyType = new Select(EAddTaskTabSelectors.CurrencyType);
    readonly maxPremiumInput = new Input(EAddTaskTabSelectors.MaxPremiumInput);
    readonly maxPriceInput = new Input(EAddTaskTabSelectors.MaxPriceInput);
    readonly maxPriceLabel = new Text(EAddTaskTabSelectors.MaxPriceLabel);
    readonly aggressionInput = new Input(EAddTaskTabSelectors.AggressionInput);
    readonly addTaskFormButton = new Button(EAddTaskTabSelectors.AddTaskFormButton);
    readonly resetFormButton = new Button(EAddTaskTabSelectors.ResetFormButton);
    readonly buyInstrumentsForm = new Text(EAddTaskTabSelectors.BuyInstrumentsForm);
    readonly sellInstrumentsForm = new Text(EAddTaskTabSelectors.SellInstrumentsForm);
    readonly resetPriceToCurrent = new Text(EAddTaskTabSelectors.ResetPriceToCurrent);
    readonly tradingSwitch = new Text(EAddTaskTabSelectors.TradingSwitch);
    readonly warningInstrumentIcon = new Text(EAddTaskTabSelectors.WarningInstrumentIcon, false);
    readonly exchangeBuySelector = new Text(EAddTaskTabSelectors.ExchangeBuySelector, false);
    readonly exchangeSellSelector = new Text(EAddTaskTabSelectors.ExchangeSellSelector, false);

    checkElementsExists(): void {
        this.taskTypeSelector.checkExists();
        this.addTaskFormButton.checkExists();
        this.resetFormButton.checkExists();
    }

    setBuyInstruments(exchangeType: string, accountType: string, instrumentType: string) {
        this.exchangeBuySelector.clickTypeWaitTextAndEnter(exchangeType, 20000);
        cy.get(testSelector(EAddTaskTabSelectors.BuyInstrumentsForm)).within(() => {
            this.accountSelector.clickTypeTextAndEnter(accountType);
            this.instrumentSelector.clickTypeTextAndEnter(instrumentType);
        });
    }

    setSellInstruments(exchangeType: string, accountType: string, instrumentType: string) {
        this.exchangeSellSelector.clickTypeWaitTextAndEnter(exchangeType, 20000);
        cy.get(testSelector(EAddTaskTabSelectors.SellInstrumentsForm)).within(() => {
            this.accountSelector.clickTypeTextAndEnter(accountType);
            this.instrumentSelector.clickTypeTextAndEnter(instrumentType);
        });
    }

    setSecondInstruments(exchangeType: string, accountType: string, instrumentType: string) {
        this.exchangeSelector.clickTypeWaitTextAndEnter(exchangeType, 20000);
        this.accountSelector.clickTypeTextAndEnter(accountType);
        this.instrumentSelector.clickTypeTextAndEnter(instrumentType);
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
