import { Given } from '@badeball/cypress-cucumber-preprocessor';

import { tableFilter } from '../../../../../../lib/page-objects/common/table/table.filter';
import { tableRow } from '../../../../../../lib/page-objects/common/table/table.row';
import { newAccountModal } from '../../../../../../lib/page-objects/trading-servers-manager/components/new-account.modal';
import { realAccountsNewAccountModal } from '../../../../../../lib/page-objects/trading-servers-manager/components/real-accounts-tab/real-accounts.new-account.modal';
import { realAccountsTab } from '../../../../../../lib/page-objects/trading-servers-manager/components/real-accounts-tab/real-accounts.tab';
import { realAccountsTableRow } from '../../../../../../lib/page-objects/trading-servers-manager/components/real-accounts-tab/real-accounts.table.row';
import { customWait } from '../../../../../../lib/web-socket/server';
import { getUuid } from '../../../../../data/random';
import { createAutotestAccount } from '../../../../../data/trading-servers-manager/generator-accounts';

Given(`user clicks on the "Add credentials" button in the modal`, () => {
    realAccountsNewAccountModal.addCredentialsButton.checkVisible();
    realAccountsNewAccountModal.addCredentialsButton.click();
    realAccountsNewAccountModal.checkElementsExists();
});

Given(
    /user clicks on the "Credentials" arrow \(closes|opens the credential input\) And (sees|not sees) "Credentials" input/,
    (value: string) => {
        realAccountsNewAccountModal.credentialsArrow.checkVisible();
        realAccountsNewAccountModal.credentialsArrow.click();
        switch (value) {
            case 'not sees':
                realAccountsNewAccountModal.checkNotVisibleCredentialsInput();
                break;
            case 'sees':
                realAccountsNewAccountModal.checkElementsExists();
                break;
        }
    },
);

Given(`user sees new real account for {string} name`, (accountName: string) => {
    realAccountsNewAccountModal.nameInput.type(accountName);
    newAccountModal.saveButton.checkEnabled();
});

Given(`user sees "User Name" in the table`, () => {
    tableFilter.nameInput.checkExists();
    cy.get('@userName').then((object) => {
        const userName = object as unknown as string;
        tableFilter.nameInput.clearTypeTextAndEnter(userName);
        realAccountsTableRow.checkFirstRowContainName(userName);
    });
});

Given(`user sees the inputted "User Name" and "User Exchange Account ID" in the table`, () => {
    customWait(1);
    tableRow.clickHeaderID();
    cy.get('@userName').then((object) => {
        const userName = object as unknown as string;
        tableFilter.nameInput.clearTypeTextAndEnter(userName);
        realAccountsTableRow.checkFirstRowContainName(userName);
        cy.get('@userExchangeAccountID').then((object) => {
            const userExchangeAccountID = object as unknown as string;
            realAccountsTableRow.checkFirstRowContainExchangeAccountID(userExchangeAccountID);
        });
    });
});

Given(`user edits "User Name" and "User Exchange Account ID" inputs`, () => {
    const random = getUuid();
    cy.get('@userName').then((object) => {
        const userName = object as unknown as string;
        cy.get('@userExchangeAccountID').then((object) => {
            const userExchangeAccountID = object as unknown as string;
            tableFilter.nameInput.clearTypeTextAndEnter(userName);
            realAccountsTableRow.doubleClickRowByName(userName);
            realAccountsNewAccountModal.nameInput.checkHaveValue(userName);
            realAccountsNewAccountModal.nameInput.clearAndTypeText(userName + random);
            realAccountsNewAccountModal.exchangeAccountIDInput.checkHaveValue(
                userExchangeAccountID,
            );
            realAccountsNewAccountModal.exchangeAccountIDInput.clearAndTypeText(
                userExchangeAccountID + random,
            );
            cy.wrap(userName + random).as('userName');
            cy.wrap(userExchangeAccountID + random).as('userExchangeAccountID');
        });
    });
});

Given(`user types {string} name in the "Real Accounts" input`, (accountName: string) => {
    tableFilter.realAccountInput.clearTypeTextAndEnter(accountName);
    customWait(1);
});

Given(`user sees "Name" and "Exchange Account ID" from the "AutotestRealAccount" user`, () => {
    customWait(1);
    const autotestAccount = createAutotestAccount();
    realAccountsTableRow.checkUserInTableRow(autotestAccount);
});

Given(`user sees all parameters "Real Account" from the "Autotest" user`, () => {
    const autotestAccount = createAutotestAccount();
    realAccountsTab.checkHeaderTable();
    realAccountsTableRow.checkCredentialInTableRow(autotestAccount);
});

Given(`user types random {string} value in the {string} input`, (value: string, nameInput) => {
    const random = getUuid();
    switch (nameInput) {
        case 'Real Account Name':
            realAccountsNewAccountModal.nameInput.clear();
            realAccountsNewAccountModal.nameInput.type(value + random);
            cy.wrap(value + random).as('userName');
            break;
        case 'Exchange Account ID':
            realAccountsNewAccountModal.exchangeAccountIDInput.type(value + random);
            cy.wrap(value + random).as('userExchangeAccountID');
            break;
    }
});

Given(
    `user sees {string} and {string} values in the table`,
    (nameRedaction: string, keyRedaction: string) => {
        customWait(1);
        tableRow.arrowButton.clickFirst();
        tableRow.nameRowText.checkContain(nameRedaction);
        realAccountsTableRow.keyRowText.checkContain(keyRedaction);
    },
);

Given(`user sees the "Real Accounts" modal of the "Autotest" user`, () => {
    const autotestAccount = createAutotestAccount();
    customWait(1);
    realAccountsNewAccountModal.checkInputModal(autotestAccount);
});

Given(`user opens the "Real Accounts" modal of the "Autotest" user`, () => {
    const autotestAccount = createAutotestAccount();
    tableRow.nameRowText.containsDoubleClick(autotestAccount.userRealAccountNameRowText);
});

Given(`user clicks on the {string} switch in the "Real Account" modal`, (nameSwitch: string) => {
    switch (nameSwitch) {
        case 'Internal':
            realAccountsNewAccountModal.internalSwitch.checkEnabled();
            realAccountsNewAccountModal.internalSwitch.click();
            break;
        case 'Credentials Internal':
            realAccountsNewAccountModal.credentialsInternalSwitch.checkEnabled();
            realAccountsNewAccountModal.credentialsInternalSwitch.click();
            break;
    }
});
