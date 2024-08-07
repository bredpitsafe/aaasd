import { Given } from '@badeball/cypress-cucumber-preprocessor';

import { confirmModal } from '../../../../../../lib/page-objects/common/confirm.modal';
import { mainMenuModal } from '../../../../../../lib/page-objects/common/main-menu.modal';
import { tableFilter } from '../../../../../../lib/page-objects/common/table/table.filter';
import { balancesTab } from '../../../../../../lib/page-objects/trading-servers-manager/components/balances/balances.tab';
import { balancesTableRow } from '../../../../../../lib/page-objects/trading-servers-manager/components/balances/balances.table.row';
import { customWait } from '../../../../../../lib/web-socket/server';

Given(
    `user sets {string} in the {string} on the {string} tab`,
    (value: string, nameFilter: string) => {
        balancesTab.selectsFilter(nameFilter, value);
        tableFilter.applyButton.clickLast();
        tableFilter.applyButton.get().last().blur();
    },
);

Given(
    `user selects {string} in the {string} on the {string} tab`,
    (value: string, nameFilter: string) => {
        balancesTab.selectsFilter(nameFilter, value);
        mainMenuModal.openSettingsButton.get().focus();
    },
);

Given(`user sees warning icon in the {string} on the {string} tab`, () => {
    tableFilter.warningIcon.checkVisible();
});

Given(`user resets the {string} on the {string} tab`, (nameFilter: string) => {
    switch (nameFilter) {
        case 'Instrument filter':
            balancesTab.instrumentsFilter.click();
            break;
        case 'Virtual Accounts filter':
            balancesTab.virtualAccountsFilter.click();
            break;
        case 'Robots filter':
            balancesTab.robotFilter.click();
            break;
        case 'Assets filter':
            balancesTab.assetsFilter.click();
            break;
    }
    tableFilter.resetButton.clickLast();
});

Given(`user sees {string} in the {string} columns in the table`, (value: string, nameColumn) => {
    switch (nameColumn) {
        case 'Instrument ID':
            balancesTableRow.checkContainInstrumentId(value);
            break;
        case 'Instrument':
            balancesTableRow.checkContainInstrumentName(value);
            break;
        case 'VA ID':
            balancesTableRow.checkContainVirtualAccountID(value);
            break;
        case 'VA':
            balancesTableRow.checkContainVirtualAccountName(value);
            break;
        case 'Robot ID':
            balancesTableRow.checkContainRobotID(value);
            break;
        case 'Robot Name':
            balancesTableRow.checkContainRobotName(value);
            break;
    }
});

Given(`user clicks on the "Non-zero balances only" switch on the {string} tab`, () => {
    tableFilter.switchButton.click();
});

Given(`user sees first value {string} in the {string} columns`, (value: string, nameColumn) => {
    switch (nameColumn) {
        case 'Assets ID':
            balancesTableRow.assetIDRowText.firstContains(value);
            break;
        case 'Assets':
            balancesTableRow.assetRowText.firstContains(value);
            break;
    }
});

Given(
    `user types {string} in the override {string} filter in the "Balances" tab`,
    (value: string, nameFilter) => {
        switch (nameFilter) {
            case 'Instrument':
                balancesTableRow.filterRow.get().eq(0).type(value);
                break;
            case 'VA':
                balancesTableRow.filterRow.get().eq(1).type(value);
                break;
            case 'Robot Name':
                balancesTableRow.filterRow.get().eq(2).type(value);
                break;
            case 'Asset':
                balancesTableRow.filterRow.get().eq(3).type(value);
                break;
        }
        customWait(1);
    },
);

Given(
    `user types {string} in the override {string} filter in the "Robot Balances" tab`,
    (value: string, nameFilter) => {
        switch (nameFilter) {
            case 'Instrument':
                balancesTableRow.filterRow.get().eq(0).type(value);
                break;
            case 'VA':
                balancesTableRow.filterRow.get().eq(1).type(value);
                break;
            case 'Asset':
                balancesTableRow.filterRow.get().eq(2).type(value);
                break;
        }
        customWait(1);
    },
);

Given(`user clicks the {string} asset in the table`, (value: string) => {
    balancesTableRow.assetRowText.containsClick(value);
    customWait(0.5);
});

Given(`user not sees a selects {string} in the {string} on the {string} tab`, () => {
    confirmModal.checkedSelectRow.checkNotExists();
});
