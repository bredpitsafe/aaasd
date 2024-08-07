import { Given } from '@badeball/cypress-cucumber-preprocessor';

import { tableFilter } from '../../../../../../lib/page-objects/common/table/table.filter';
import { tableHeader } from '../../../../../../lib/page-objects/common/table/table.header';
import { tableRow } from '../../../../../../lib/page-objects/common/table/table.row';
import { newAccountModal } from '../../../../../../lib/page-objects/trading-servers-manager/components/new-account.modal';
import { realAccountsNewAccountModal } from '../../../../../../lib/page-objects/trading-servers-manager/components/real-accounts-tab/real-accounts.new-account.modal';
import { realAccountsTableRow } from '../../../../../../lib/page-objects/trading-servers-manager/components/real-accounts-tab/real-accounts.table.row';
import { virtualAccountsNewAccountModal } from '../../../../../../lib/page-objects/trading-servers-manager/components/virtual-accounts-tab/virtual-accounts.new-account.modal';
import { virtualAccountsTab } from '../../../../../../lib/page-objects/trading-servers-manager/components/virtual-accounts-tab/virtual-accounts.tab';
import { virtualAccountsTableRow } from '../../../../../../lib/page-objects/trading-servers-manager/components/virtual-accounts-tab/virtual-accounts.table.row';
import { customWait } from '../../../../../../lib/web-socket/server';
import { getUuid } from '../../../../../data/random';
import { createAutotestAccount } from '../../../../../data/trading-servers-manager/generator-accounts';

Given(`user types {string} name in the "Virtual Accounts" input`, (accountName: string) => {
    tableHeader.checkVisibleRowsTable();
    tableFilter.virtualAccountInput.clearTypeTextAndEnter(accountName);
    tableHeader.checkVisibleRowsTable();
});

Given(`user sees "Name" from the "AutotestVirtualAccount" user`, () => {
    customWait(1);
    const autotestAccount = createAutotestAccount();
    virtualAccountsTableRow.checkUserInTableRow(autotestAccount);
    virtualAccountsTab.checkUserHeaderTable();
});

Given(`user sees all parameters "Virtual Account" from the "Autotest" user`, () => {
    const autotestAccount = createAutotestAccount();
    virtualAccountsTableRow.checkRealAccountInTableRow(autotestAccount);
});

Given(`user sees "Create Virtual Account" modal`, () => {
    virtualAccountsNewAccountModal.checkElementsExists();
});

Given(`user opens the "Virtual Accounts" modal of the {string} user`, (userName: string) => {
    tableRow.nameRowText.containsDoubleClick(userName);
});

Given(`user opens the "Real Accounts" modal of the "AutotestVirtualAccount" user`, () => {
    tableRow.arrowButton.click();
    realAccountsTableRow.nameRealAccountRowText.doubleClick();
});

Given(`user sees the "Virtual Accounts" modal of the "Autotest" user`, () => {
    const autotestAccount = createAutotestAccount();
    virtualAccountsNewAccountModal.checkInputModal(autotestAccount);
});

Given(`user clicks on the "Delete" "Real Account" button`, () => {
    virtualAccountsNewAccountModal.deleteRealAccountsButton.click();
});

Given(`user types random {string} in the "Virtual Account Name" input`, (nameInput) => {
    const random = getUuid();
    realAccountsNewAccountModal.nameInput.clear();
    realAccountsNewAccountModal.nameInput.type(nameInput + random);
    cy.wrap(nameInput + random).as('userVirtualName');
});

Given(/user sees the inputted "User Name" in the table/, () => {
    customWait(1);
    tableRow.clickHeaderID();
    cy.get('@userVirtualName').then((object) => {
        const userVirtualName = object as unknown as string;
        tableFilter.virtualAccountInput.clearTypeTextAndEnter(userVirtualName);
        tableRow.nameRowText.checkContain(userVirtualName);
    });
});

Given(/user types new "User Name" in the table/, () => {
    customWait(1);
    cy.get('@userVirtualName').then((object) => {
        const userVirtualName = object as unknown as string;
        tableFilter.virtualAccountInput.clearTypeTextAndEnter(userVirtualName);
    });
});

Given(`user selects new created "Account" in the "Real Accounts" section`, () => {
    cy.get('@userName').then((object) => {
        const userVirtualName = object as unknown as string;
        virtualAccountsNewAccountModal.realAccountsSelect.typeAndClickByText(userVirtualName);
    });
});

Given(
    `user deletes "AutotestForVirtualAccount" "Real Account" and selects "AutotestEditForVirtualAccount" "Real Account"`,
    () => {
        virtualAccountsNewAccountModal.deleteRealAccountsButton.click();
        cy.get('@userNameSecond').then((object) => {
            const userNameSecond = object as unknown as string;
            virtualAccountsNewAccountModal.realAccountsSelect.typeAndClickByText(userNameSecond);
            cy.wrap(userNameSecond).as('userName');
        });
    },
);

Given(`user checks the "Real Account" name`, () => {
    tableRow.arrowButton.click();
    const autotestAccount = createAutotestAccount();
    virtualAccountsTableRow.checkRealAccountInTableRow(autotestAccount);
});

Given(`user checks inputted "RealAccountName" and "VirtualAccountName" names`, () => {
    customWait(1);
    tableRow.clickHeaderID();
    virtualAccountsTab.openVirtualAccount();
    cy.get('@userName').then((object) => {
        const userName = object as unknown as string;
        realAccountsTableRow.nameRealAccountRowText.checkContain(userName);
    });
});

Given(`user checks selects two "Real Accounts" names`, () => {
    customWait(1);
    tableRow.clickHeaderID();
    virtualAccountsTab.openVirtualAccount();
    cy.get('@userName').then((object) => {
        const userName = object as unknown as string;
        virtualAccountsTab.checkUserNameRowByIndexHaveText(0, userName);
    });
    cy.get('@userNameSecond').then((object) => {
        const userNameSecond = object as unknown as string;
        virtualAccountsTab.checkUserNameRowByIndexHaveText(1, userNameSecond);
    });
});

Given(
    /user created(| second) random "Real Account" fo "([^"]*)" name/,
    (type: string, name: string) => {
        const random = getUuid();
        realAccountsNewAccountModal.creatAccount();
        realAccountsNewAccountModal.nameInput.type(name + random);
        type.includes('second')
            ? cy.wrap(name + random).as('userNameSecond')
            : cy.wrap(name + random).as('userName');
        newAccountModal.clickSaveButton();
        customWait(1);
    },
);

Given(`user selects two "AutotestRealAccountName" in the "Real Accounts" section`, () => {
    cy.get('@userName').then((object) => {
        const userName = object as unknown as string;
        virtualAccountsNewAccountModal.realAccountsSelect.typeAndClickByText(userName);
        cy.get('@userNameSecond').then((object) => {
            const userNameSecond = object as unknown as string;
            virtualAccountsNewAccountModal.realAccountsSelect.clear();
            virtualAccountsNewAccountModal.realAccountsSelect.typeAndClickByText(userNameSecond);
        });
    });
});

Given(`user opens the "Virtual Accounts" and "Real Accounts" modal and edits name`, () => {
    customWait(1);
    const random = getUuid();
    cy.get('@userVirtualName').then((object) => {
        const userVirtualName = object as unknown as string;
        tableFilter.virtualAccountInput.type(userVirtualName);
        customWait(2);
        tableFilter.virtualAccountInput.type('{enter}');
        customWait(1);
        tableRow.nameRowText.containsDoubleClick(userVirtualName);
        realAccountsNewAccountModal.nameInput.clearAndTypeText(userVirtualName + random);
        cy.wrap(userVirtualName + random).as('userVirtualName');
    });
});

Given(`user clicks on the "Internal" switch in the "Virtual Account" modal`, () => {
    virtualAccountsNewAccountModal.internalSwitch.checkExists();
    virtualAccountsNewAccountModal.internalSwitch.clickForce();
});
