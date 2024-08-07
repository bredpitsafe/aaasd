import { DataTable, Given } from '@badeball/cypress-cucumber-preprocessor';

import { addAutoTransferRuleTab } from '../../../../lib/page-objects/balance-monitor/components/add-auto-transfer-rule/add-auto-transfer-rule.tab';
import { autoTransferRulesTab } from '../../../../lib/page-objects/balance-monitor/components/auto-transfer-rules/auto-transfer-rules.tab';
import { autoTransferRulesTableRow } from '../../../../lib/page-objects/balance-monitor/components/auto-transfer-rules/auto-transfer-rules.table.row';
import { tableFilter } from '../../../../lib/page-objects/common/table/table.filter';
import { tableHeader } from '../../../../lib/page-objects/common/table/table.header';
import { ETime } from '../../../../lib/page-objects/common/time';
import { getDataAutoTransferRule } from '../../../data/balance-monitor/getDataAutoTransferRule';
import { getDataUpdateRule } from '../../../data/balance-monitor/getDataUpdatedRule';
import { dateChange } from '../../../data/date';
import { getUuid } from '../../../data/random';
const userName = 'frontend';

Given(`user sees the {string} tab in the "Auto Transfer Rules" page`, (nameTab: string) => {
    switch (nameTab) {
        case 'Add Auto Transfer Rule':
            addAutoTransferRuleTab.checkVisibleTab();
            addAutoTransferRuleTab.checkElementExist();
            break;
        case 'Auto Transfer Rules':
            autoTransferRulesTab.checkVisibleTable();
            autoTransferRulesTab.checkElementExist();
            break;
    }
});

Given(`user clicks on the {string} in the "Add Auto Transfer Rule" form`, (nameMode: string) => {
    addAutoTransferRuleTab.addAutoTransferRuleTab.containsClick(nameMode);
});

Given(`user sees the "Advanced Mode" in the "Add Auto Transfer Rule" form`, () => {
    addAutoTransferRuleTab.rulePriorityInput.checkVisible();
});

Given(`user selects auto transfer rule type values:`, (dataTable: DataTable) => {
    const random = getUuid();
    dataTable.hashes().forEach((element) => {
        addAutoTransferRuleTab.coinSelector.typeAndClickByText(element.coin);
        addAutoTransferRuleTab.exchangeSelector.typeAndClickByTextFirst(element.sourceExchange);
        addAutoTransferRuleTab.exchangeSelector.typeAndClickByText(element.destinationExchange);
        addAutoTransferRuleTab.accountSelector.typeAndClickByTextFirst(element.sourceAccount);
        addAutoTransferRuleTab.accountSelector.typeAndClickByText(element.destinationAccount);
        addAutoTransferRuleTab.notesInput.type(element.notes + random);
        cy.wrap(element.notes + random).as('notes');
    });
});

Given(`user sees new create auto transfer rule in the "Auto Transfer Rules" table`, () => {
    const data = getDataAutoTransferRule();
    tableFilter.nameInput.clearTypeTextAndEnter(userName);
    autoTransferRulesTableRow.createsRowText.contains(dateChange(ETime.Now));
    cy.get('@notes').then((object) => {
        const notes = object as unknown as string;
        autoTransferRulesTableRow.noteRowText.contains(notes);
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
        autoTransferRulesTableRow[`${row}RowText`].firstContains(data[row]);
    }
});

Given(`user sees updated auto transfer rule in the "Auto Transfer Rules" table`, () => {
    const data = getDataUpdateRule();
    tableFilter.nameInput.clearTypeTextAndEnter(userName);
    autoTransferRulesTableRow.updateTimeRowText.contains(dateChange(ETime.Now));
    cy.get('@notes').then((object) => {
        const notes = object as unknown as string;
        autoTransferRulesTableRow.noteRowText.contains(notes);
    });
    const propertiesToCheck = ['coinRule', 'userName', 'destinationExchange', 'destinationAccount'];
    for (const row of propertiesToCheck) {
        autoTransferRulesTableRow[`${row}RowText`].firstContains(data[row]);
    }
});

Given(`user not sees new create amount limits rule in the "Auto Transfer Rules" table`, () => {
    tableFilter.nameInput.clearTypeTextAndEnter(userName);
    cy.get('@notes').then((object) => {
        const notes = object as unknown as string;
        addAutoTransferRuleTab.addAutoTransferRuleTab.checkNotContain(notes);
    });
});

Given(`user sees active "Create" button in the "Add Auto Transfer Rule" form`, () => {
    addAutoTransferRuleTab.createButton.checkEnabled();
});

Given(
    `user deletes all rules users {string} in the "Auto Transfer Rules" table`,
    (nameUser: string) => {
        tableFilter.nameInput.clearTypeTextAndEnter(nameUser);
        tableHeader.checkNotVisibleLoad();
        autoTransferRulesTableRow.deleteAllCreatedRows(nameUser);
    },
);

Given(
    `user clicks a {string} button in the "Add Auto Transfer Rule" form`,
    (nameButton: string) => {
        switch (nameButton) {
            case 'Clear':
                addAutoTransferRuleTab.clearButton.click();
                break;
            case 'Create':
                addAutoTransferRuleTab.createButton.click();
                break;
        }
    },
);

Given(
    `user sees {string} {string} in the "Auto Transfer Rules" table`,
    (nameValue: string, nameRow: string) => {
        switch (nameRow) {
            case 'status':
                autoTransferRulesTableRow.checkContainActualStatus(nameValue);
                break;
            case 'coin':
                autoTransferRulesTableRow.checkContainCoinRule(nameValue);
                break;
            case 'userName':
                autoTransferRulesTableRow.checkContainUserName(nameValue);
                break;
            case 'sourceAccount':
                autoTransferRulesTableRow.checkContainSourceAccount(nameValue);
                break;
        }
    },
);

Given(/user (sees|not sees) data on the "Add Auto Transfer Rule" form/, (checkContain: string) => {
    const data = getDataAutoTransferRule();
    switch (checkContain) {
        case 'sees':
            addAutoTransferRuleTab.coinSelector.contains(data.coinRule);
            addAutoTransferRuleTab.exchangeSelector.contains(data.sourceExchange);
            addAutoTransferRuleTab.exchangeSelector.contains(data.destinationExchange);
            addAutoTransferRuleTab.accountSelector.contains(data.sourceAccount);
            addAutoTransferRuleTab.accountSelector.contains(data.destinationAccount);
            addAutoTransferRuleTab.notesInput.contains(data.notes);
            break;
        case 'not sees':
            addAutoTransferRuleTab.coinSelector.checkNotContain(data.coinRule);
            addAutoTransferRuleTab.exchangeSelector.checkNotContain(data.sourceExchange);
            addAutoTransferRuleTab.exchangeSelector.checkNotContain(data.destinationExchange);
            addAutoTransferRuleTab.notesInput.checkNotContain(data.notes);
            break;
    }
});

Given(
    `user does not sees the {string} value in the "Add Auto Transfer Rule" form`,
    (nameValue: string) => {
        addAutoTransferRuleTab.addAutoTransferRuleTab.checkNotContain(nameValue);
    },
);

Given(
    `user sees that the {string} switch is {string} in the "Add Auto Transfer Rule" form`,
    (nameSwitch: string, valueSwitch: string) => {
        switch (nameSwitch) {
            case 'Both directions':
                addAutoTransferRuleTab.bothDirectionsSwitch.contains(valueSwitch);
                break;
            case 'Auto Transfer':
                addAutoTransferRuleTab.autoTransferSwitch.contains(valueSwitch);
                break;
        }
    },
);

Given(
    `user clicks on the {string} switch in the "Add Auto Transfer Rule" form`,
    (nameSwitch: string) => {
        switch (nameSwitch) {
            case 'Both directions':
                addAutoTransferRuleTab.bothDirectionsSwitch.click();
                break;
            case 'Auto Transfer':
                addAutoTransferRuleTab.autoTransferSwitch.click();
                break;
        }
    },
);
