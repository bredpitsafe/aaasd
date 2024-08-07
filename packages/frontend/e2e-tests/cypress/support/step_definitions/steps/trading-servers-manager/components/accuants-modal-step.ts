import { DataTable, Given } from '@badeball/cypress-cucumber-preprocessor';

import { tableFilter } from '../../../../../lib/page-objects/common/table/table.filter';
import { tableRow } from '../../../../../lib/page-objects/common/table/table.row';
import { newAccountModal } from '../../../../../lib/page-objects/trading-servers-manager/components/new-account.modal';
import { realAccountsNewAccountModal } from '../../../../../lib/page-objects/trading-servers-manager/components/real-accounts-tab/real-accounts.new-account.modal';
import { realAccountsTableRow } from '../../../../../lib/page-objects/trading-servers-manager/components/real-accounts-tab/real-accounts.table.row';
import { virtualAccountsNewAccountModal } from '../../../../../lib/page-objects/trading-servers-manager/components/virtual-accounts-tab/virtual-accounts.new-account.modal';
import { customWait } from '../../../../../lib/web-socket/server';

Given(`user sees "Create Real Account" modal`, () => {
    realAccountsNewAccountModal.checkElementsExists();
});

Given(`user deletes the "Credentials" params from the modal`, () => {
    realAccountsNewAccountModal.deleteCredentialsButton.click();
});

Given(`user sees "Save" button that is {string}`, (ability: string) => {
    switch (ability) {
        case 'enabled':
            newAccountModal.saveButton.checkEnabled();
            break;
        case 'disabled':
            newAccountModal.saveButton.checkNotEnabled();
            break;
    }
});

Given(`user types {string} in the {string} input`, (value: string, nameInput: string) => {
    newAccountModal.saveButton.checkNotEnabled();
    switch (nameInput) {
        case 'Real Account Name':
            realAccountsNewAccountModal.nameInput.type(value);
            break;
        case 'Exchange Account ID':
            realAccountsNewAccountModal.exchangeAccountIDInput.type(value);
            break;
        case 'Virtual Account Name':
            virtualAccountsNewAccountModal.nameInput.type(value);
            break;
        case 'Real Accounts':
            virtualAccountsNewAccountModal.realAccountsSelect.typeAndClickByText(value);
            break;
    }
});

Given(`user types "Credentials" values:`, (dataTable: DataTable) => {
    dataTable.hashes().forEach((element) => {
        realAccountsNewAccountModal.credentialsNameInput.clear();
        realAccountsNewAccountModal.credentialsNameInput.type(element.name);

        realAccountsNewAccountModal.credentialsKeyInput.clear();
        realAccountsNewAccountModal.credentialsKeyInput.type(element.key);

        realAccountsNewAccountModal.credentialsSecretInput.clear();
        realAccountsNewAccountModal.credentialsSecretInput.type(element.secret);

        realAccountsNewAccountModal.credentialsPassphraseInput.clear();
        realAccountsNewAccountModal.credentialsPassphraseInput.type(element.passphrase);
    });
});

Given(`user edits "Credentials" values:`, (dataTable: DataTable) => {
    customWait(1);
    tableRow.clickHeaderID();
    cy.get('@userName').then((object) => {
        const userName = object as unknown as string;
        tableFilter.nameInput.clearTypeTextAndEnter(userName);
        realAccountsTableRow.doubleClickRowByName(userName);
    });
    dataTable.hashes().forEach((element) => {
        realAccountsNewAccountModal.credentialsNameInput.clearAndTypeText(element.name);
        realAccountsNewAccountModal.credentialsKeyInput.clearAndTypeText(element.key);
        realAccountsNewAccountModal.credentialsSecretEditInput.clear();
        realAccountsNewAccountModal.credentialsSecretInput.type(element.secret);
        realAccountsNewAccountModal.credentialsPassphraseEditInput.clear();
        realAccountsNewAccountModal.credentialsPassphraseInput.type(element.passphrase);
    });
});
