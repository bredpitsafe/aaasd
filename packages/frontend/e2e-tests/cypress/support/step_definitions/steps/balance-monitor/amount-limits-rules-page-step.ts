import { DataTable, Given } from '@badeball/cypress-cucumber-preprocessor';

import { addAmountLimitsRuleTab } from '../../../../lib/page-objects/balance-monitor/components/add-amount-limits-rule/add-amount-limits-rule.tab';
import { amountLimitsRulesTab } from '../../../../lib/page-objects/balance-monitor/components/amount-limits-rules/amount-limits-rules.tab';
import { amountLimitsRulesTableRow } from '../../../../lib/page-objects/balance-monitor/components/amount-limits-rules/amount-limits-rules.table.row';
import { tableFilter } from '../../../../lib/page-objects/common/table/table.filter';
import { tableHeader } from '../../../../lib/page-objects/common/table/table.header';
import { ETime } from '../../../../lib/page-objects/common/time';
import { getDataAmountLimitsRule } from '../../../data/balance-monitor/getDataAmountLimitsRule';
import { getDataUpdateRule } from '../../../data/balance-monitor/getDataUpdatedRule';
import { dateChange } from '../../../data/date';
import { getUuid } from '../../../data/random';
const userName = 'frontend';

Given(`user sees the {string} tab in the "Amount Limits Rules" page`, (nameTab: string) => {
    switch (nameTab) {
        case 'Add Amount Limits Rule':
            addAmountLimitsRuleTab.checkVisibleTab();
            addAmountLimitsRuleTab.checkElementExist();
            break;
        case 'Amount Limits Rules':
            amountLimitsRulesTab.checkVisibleTable();
            amountLimitsRulesTab.checkElementExist();
            break;
    }
});

Given(`user clicks on the {string} in the "Add Amount Limits Rule" form`, (nameMode: string) => {
    addAmountLimitsRuleTab.addAmountLimitsRuleTab.containsClick(nameMode);
});

Given(`user sees the "Advanced Mode" in the "Add Amount Limits Rule" form`, () => {
    addAmountLimitsRuleTab.rulePriorityInput.checkVisible();
    addAmountLimitsRuleTab.bothDirectionsSwitch.checkVisible();
});

Given(`user selects amount limits rule type values:`, (dataTable: DataTable) => {
    const random = getUuid();
    dataTable.hashes().forEach((element) => {
        addAmountLimitsRuleTab.coinSelector.typeAndClickByText(element.coin);
        addAmountLimitsRuleTab.exchangeSelector.typeAndClickByTextFirst(element.sourceExchange);
        addAmountLimitsRuleTab.exchangeSelector.typeAndClickByText(element.destinationExchange);
        addAmountLimitsRuleTab.accountSelector.typeAndClickByTextFirst(element.sourceAccount);
        addAmountLimitsRuleTab.accountSelector.typeAndClickByText(element.destinationAccount);
        addAmountLimitsRuleTab.amountInput.typeFirst(element.minAmount);
        addAmountLimitsRuleTab.amountInput.type(element.maxAmount);
        addAmountLimitsRuleTab.notesInput.type(element.notes + random);
        cy.wrap(element.notes + random).as('notes');
    });
});

Given(`user sees new create amount limits rule in the "Amount Limits Rules" table`, () => {
    const data = getDataAmountLimitsRule();
    tableFilter.nameInput.clearTypeTextAndEnter(userName);
    amountLimitsRulesTableRow.createsRowText.contains(dateChange(ETime.Now));
    cy.get('@notes').then((object) => {
        const notes = object as unknown as string;
        amountLimitsRulesTableRow.noteRowText.contains(notes);
    });
    const propertiesToCheck = [
        'coinRule',
        'userName',
        'sourceExchange',
        'sourceAccount',
        'destinationExchange',
        'destinationAccount',
    ];
    for (const row of propertiesToCheck) {
        amountLimitsRulesTableRow[`${row}RowText`].firstContains(data[row]);
    }
});

Given(`user sees updated amount limits rule in the "Amount Limits Rules" table`, () => {
    const data = getDataUpdateRule();
    tableFilter.nameInput.clearTypeTextAndEnter(userName);
    amountLimitsRulesTableRow.updateTimeRowText.contains(dateChange(ETime.Now));
    cy.get('@notes').then((object) => {
        const notes = object as unknown as string;
        amountLimitsRulesTableRow.noteRowText.contains(notes);
    });
    const propertiesToCheck = ['coinRule', 'userName', 'destinationExchange', 'destinationAccount'];
    for (const row of propertiesToCheck) {
        amountLimitsRulesTableRow[`${row}RowText`].firstContains(data[row]);
    }
});

Given(`user not sees new create amount limits rule in the "Amount Limits Rules" table`, () => {
    tableFilter.nameInput.clearTypeTextAndEnter(userName);
    cy.get('@notes').then((object) => {
        const notes = object as unknown as string;
        addAmountLimitsRuleTab.addAmountLimitsRuleTab.checkNotContain(notes);
    });
});

Given(`user sees not active "Create" button in the "Add Amount Limits Rule" form`, () => {
    addAmountLimitsRuleTab.createButton.checkNotEnabled();
});

Given(
    `user deletes all rules users {string} in the "Amount Limits Rules" table`,
    (nameUser: string) => {
        tableFilter.nameInput.clearTypeTextAndEnter(nameUser);
        tableHeader.checkNotVisibleLoad();
        amountLimitsRulesTableRow.deleteAllCreatedRows(nameUser);
    },
);

Given(
    `user clicks a {string} button in the "Add Amount Limits Rule" form`,
    (nameButton: string) => {
        switch (nameButton) {
            case 'Clear':
                addAmountLimitsRuleTab.clearButton.click();
                break;
            case 'Create':
                addAmountLimitsRuleTab.createButton.click();
                break;
        }
    },
);

Given(
    `user sees {string} {string} in the "Amount Limits Rules" table`,
    (nameValue: string, nameRow: string) => {
        switch (nameRow) {
            case 'status':
                amountLimitsRulesTableRow.checkContainActualStatus(nameValue);
                break;
            case 'coin':
                amountLimitsRulesTableRow.checkContainCoinRule(nameValue);
                break;
            case 'userName':
                amountLimitsRulesTableRow.checkContainUserName(nameValue);
                break;
            case 'sourceAccount':
                amountLimitsRulesTableRow.checkContainSourceAccount(nameValue);
                break;
        }
    },
);

Given(/user (sees|not sees) data on the "Add Amount Limits Rule" form/, (checkContain: string) => {
    const data = getDataAmountLimitsRule();
    switch (checkContain) {
        case 'sees':
            addAmountLimitsRuleTab.coinSelector.contains(data.coinRule);
            addAmountLimitsRuleTab.exchangeSelector.contains(data.sourceExchange);
            addAmountLimitsRuleTab.exchangeSelector.contains(data.destinationExchange);
            addAmountLimitsRuleTab.accountSelector.contains(data.sourceAccount);
            addAmountLimitsRuleTab.accountSelector.contains(data.destinationAccount);
            addAmountLimitsRuleTab.notesInput.contains(data.notes);
            break;
        case 'not sees':
            addAmountLimitsRuleTab.coinSelector.checkNotContain(data.coinRule);
            addAmountLimitsRuleTab.exchangeSelector.checkNotContain(data.sourceExchange);
            addAmountLimitsRuleTab.exchangeSelector.checkNotContain(data.destinationExchange);
            addAmountLimitsRuleTab.amountInput.checkNotContain(data.minAmount);
            addAmountLimitsRuleTab.amountInput.checkNotContain(data.maxAmount);
            addAmountLimitsRuleTab.notesInput.checkNotContain(data.notes);
            break;
    }
});

Given(
    `user does not sees the {string} value in the "Add Amount Limits Rule" form`,
    (nameValue: string) => {
        addAmountLimitsRuleTab.addAmountLimitsRuleTab.checkNotContain(nameValue);
    },
);

Given(
    `user sees that the {string} switch is {string} in the "Add Amount Limits Rule" form`,
    (nameSwitch: string, valueSwitch: string) => {
        switch (nameSwitch) {
            case 'Both directions':
                addAmountLimitsRuleTab.bothDirectionsSwitch.contains(valueSwitch);
                break;
            case 'Do not override':
                addAmountLimitsRuleTab.bothDirectionsSwitch.contains(valueSwitch);
                break;
        }
    },
);

Given(
    `user clicks on the {string} switch in the "Add Amount Limits Rule" form`,
    (nameSwitch: string) => {
        switch (nameSwitch) {
            case 'Both directions':
                addAmountLimitsRuleTab.bothDirectionsSwitch.click();
                break;
            case 'Do not override':
                addAmountLimitsRuleTab.doNotOverrideSwitch.click();
                break;
        }
    },
);
