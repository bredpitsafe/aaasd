import { DataTable, Given } from '@badeball/cypress-cucumber-preprocessor';

import { addTransferBlockingRuleTab } from '../../../../lib/page-objects/balance-monitor/components/add-transfer-blocking-rule/add-transfer-blocking-rule.tab';
import { transferBlockingRulesTab } from '../../../../lib/page-objects/balance-monitor/components/transfer-blocking-rules/transfer-blocking-rules.tab';
import { transferBlockingRulesTableRow } from '../../../../lib/page-objects/balance-monitor/components/transfer-blocking-rules/transfer-blocking-rules.table.row';
import { transfersHistoryTableRow } from '../../../../lib/page-objects/balance-monitor/components/transfers-history/transfers-history.table.row';
import { contextMenu } from '../../../../lib/page-objects/common/context.menu';
import { tableFilter } from '../../../../lib/page-objects/common/table/table.filter';
import { tableHeader } from '../../../../lib/page-objects/common/table/table.header';
import { ETime } from '../../../../lib/page-objects/common/time';
import { getDataTransferBlockingRule } from '../../../data/balance-monitor/getDataTransferBlockingRule';
import { getDataUpdateRule } from '../../../data/balance-monitor/getDataUpdatedRule';
import { dateChange } from '../../../data/date';
import { getUuid } from '../../../data/random';
const userName = 'frontend';

Given(`user sees the {string} tab in the "Transfer Blocking Rules" page`, (nameTab: string) => {
    switch (nameTab) {
        case 'Add Transfer Blocking Rule':
            addTransferBlockingRuleTab.checkVisibleTab();
            addTransferBlockingRuleTab.checkElementExist();
            break;
        case 'Transfer Blocking Rules':
            transferBlockingRulesTab.checkVisibleTable();
            break;
    }
});

Given(`user selects transfer blocking rule type values:`, (dataTable: DataTable) => {
    const random = getUuid();
    dataTable.hashes().forEach((element) => {
        addTransferBlockingRuleTab.coinSelector.typeAndClickByText(element.coin);
        addTransferBlockingRuleTab.exchangeSelector.typeAndClickByTextFirst(element.sourceExchange);
        addTransferBlockingRuleTab.exchangeSelector.typeAndClickByText(element.destinationExchange);
        addTransferBlockingRuleTab.accountSelector.typeAndClickByTextFirst(element.sourceAccount);
        addTransferBlockingRuleTab.accountSelector.typeAndClickByText(element.destinationAccount);
        addTransferBlockingRuleTab.notesInput.type(element.notes + random);
        cy.wrap(element.notes + random).as('notes');
    });
});

Given(
    /user (sees|not sees) data on the "Add Transfer Blocking Rule" form/,
    (checkContain: string) => {
        const data = getDataTransferBlockingRule();
        switch (checkContain) {
            case 'sees':
                addTransferBlockingRuleTab.coinSelector.contains(data.coinRule);
                addTransferBlockingRuleTab.exchangeSelector.contains(data.sourceExchange);
                addTransferBlockingRuleTab.exchangeSelector.contains(data.destinationExchange);
                addTransferBlockingRuleTab.accountSelector.contains(data.sourceAccount);
                addTransferBlockingRuleTab.accountSelector.contains(data.destinationAccount);
                addTransferBlockingRuleTab.notesInput.contains(data.notes);
                break;
            case 'not sees':
                addTransferBlockingRuleTab.coinSelector.checkNotContain(data.coinRule);
                addTransferBlockingRuleTab.exchangeSelector.checkNotContain(data.sourceExchange);
                addTransferBlockingRuleTab.exchangeSelector.checkNotContain(
                    data.destinationExchange,
                );
                addTransferBlockingRuleTab.notesInput.checkNotContain(data.notes);
                break;
        }
    },
);

Given(
    `user clicks a {string} button in the "Add Transfer Blocking Rule" form`,
    (nameButton: string) => {
        switch (nameButton) {
            case 'Clear':
                addTransferBlockingRuleTab.clearButton.click();
                break;
            case 'Create':
                addTransferBlockingRuleTab.createButton.click();
                break;
        }
    },
);

Given(`user sees new create transfer blocking rule in the "Transfer Blocking Rules" table`, () => {
    const data = getDataTransferBlockingRule();
    tableFilter.nameInput.clearTypeTextAndEnter(userName);
    transfersHistoryTableRow.createsRowText.contains(dateChange(ETime.Now));
    cy.get('@notes').then((object) => {
        const notes = object as unknown as string;
        transfersHistoryTableRow.noteRowText.contains(notes);
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
        transferBlockingRulesTableRow[`${row}RowText`].firstContains(data[row]);
    }
});

Given(`user sees updated transfer blocking rule in the "Transfer Blocking Rules" table`, () => {
    const data = getDataUpdateRule();
    tableFilter.nameInput.clearTypeTextAndEnter(userName);
    transfersHistoryTableRow.updateTimeRowText.contains(dateChange(ETime.Now));
    cy.get('@notes').then((object) => {
        const notes = object as unknown as string;
        transfersHistoryTableRow.noteRowText.contains(notes);
    });
    const propertiesToCheck = ['coinRule', 'userName', 'destinationExchange', 'destinationAccount'];
    for (const row of propertiesToCheck) {
        transferBlockingRulesTableRow[`${row}RowText`].firstContains(data[row]);
    }
});

Given(
    `user not sees new create transfer blocking rule in the "Transfer Blocking Rules" table`,
    () => {
        tableFilter.nameInput.clearTypeTextAndEnter(userName);
        cy.get('@notes').then((object) => {
            const notes = object as unknown as string;
            transferBlockingRulesTab.transferBlockingRulesTab.checkNotContain(notes);
        });
    },
);

Given(
    `user does not sees the {string} value in the "Add Transfer Blocking Rule" form`,
    (value: string) => {
        addTransferBlockingRuleTab.addTransferBlockingRuleTab.checkNotContain(value);
    },
);

Given(`user selects the {string} of the "Disabled" selector`, (value: string) => {
    addTransferBlockingRuleTab.disabledSelector.click();
    addTransferBlockingRuleTab.disabledSelector.selectsByText(value);
});

Given(`user sees that the {string} in the "Disabled" selector`, (value: string) => {
    addTransferBlockingRuleTab.disabledSelector.checkContain(value);
});

Given(`user sees the "Start time" and "End time" switches`, () => {
    addTransferBlockingRuleTab.startTimeSwitch.checkVisible();
    addTransferBlockingRuleTab.endTimeSwitch.checkVisible();
});

Given(`user sees the "Period" input field in the "Add Transfer Blocking Rule" form`, () => {
    addTransferBlockingRuleTab.periodSelector.checkVisible();
    addTransferBlockingRuleTab.periodInput.checkVisible();
});

Given(`user sees the "Days" and "Hours" selector in the "Add Transfer Blocking Rule" form`, () => {
    addTransferBlockingRuleTab.periodSelector.contains('Days');
    addTransferBlockingRuleTab.periodSelector.typeAndClickByText('Hours');
    addTransferBlockingRuleTab.periodSelector.contains('Hours');
});

Given(`user sees the "Start time" and "End time" input field`, () => {
    addTransferBlockingRuleTab.startPeriodInput.checkEnabled();
    addTransferBlockingRuleTab.startPeriodInput.checkVisible();
    addTransferBlockingRuleTab.endPeriodInput.checkEnabled();
    addTransferBlockingRuleTab.endPeriodInput.checkVisible();
});

Given(`user sets the date {string} in the "End time" calendar`, (data: string) => {
    addTransferBlockingRuleTab.endPeriodInput.clickTypeTextAndEnter(data);
});

Given(
    `user clicks on the {string} switch in the "Add Transfer Blocking Rule" form`,
    (nameSwitch: string) => {
        switch (nameSwitch) {
            case 'Both directions':
                addTransferBlockingRuleTab.bothDirectionsSwitch.click();
                break;
            case 'Alert':
                addTransferBlockingRuleTab.alertSwitch.click();
                break;
            case 'Permanent':
                addTransferBlockingRuleTab.permanentSwitch.click();
                break;
            case 'Start time':
                addTransferBlockingRuleTab.startTimeSwitch.click();
                break;
            case 'End time':
                addTransferBlockingRuleTab.endTimeSwitch.click();
                break;
        }
    },
);

Given(
    `user sees that the {string} switch is {string} in the "Add Transfer Blocking Rule" form`,
    (nameSwitch: string, valueSwitch: string) => {
        switch (nameSwitch) {
            case 'Both directions':
                addTransferBlockingRuleTab.bothDirectionsSwitch.contains(valueSwitch);
                break;
            case 'Alert':
                addTransferBlockingRuleTab.alertSwitch.contains(valueSwitch);
                break;
            case 'Permanent':
                addTransferBlockingRuleTab.permanentSwitch.contains(valueSwitch);
                break;
            case 'Start time':
                addTransferBlockingRuleTab.startTimeSwitch.contains(valueSwitch);
                break;
            case 'End time':
                addTransferBlockingRuleTab.endTimeSwitch.contains(valueSwitch);
                break;
        }
    },
);

Given(
    `user selects a {string} rule and selects in the context menu of {string}`,
    (nameUser: string, nameItem: string) => {
        transferBlockingRulesTableRow.userNameRowText.get().contains(nameUser).rightclick();
        contextMenu.contextMenu.containsClick(nameItem);
    },
);

Given(
    `user deletes all rules users {string} in the "Transfer Blocking Rules" table`,
    (nameUser: string) => {
        tableFilter.nameInput.clearTypeTextAndEnter(nameUser);
        tableHeader.checkNotVisibleLoad();
        transferBlockingRulesTableRow.deleteAllCreatedRows(nameUser);
    },
);

Given(
    `user sees {string} {string} in the "Transfer Blocking Rules" table`,
    (nameValue: string, nameRow: string) => {
        switch (nameRow) {
            case 'status':
                transferBlockingRulesTableRow.checkContainActualStatus(nameValue);
                break;
            case 'coin':
                transferBlockingRulesTableRow.checkContainCoinRule(nameValue);
                break;
            case 'userName':
                transferBlockingRulesTableRow.checkContainUserName(nameValue);
                break;
            case 'sourceAccount':
                transferBlockingRulesTableRow.checkContainSourceAccount(nameValue);
                break;
        }
    },
);
