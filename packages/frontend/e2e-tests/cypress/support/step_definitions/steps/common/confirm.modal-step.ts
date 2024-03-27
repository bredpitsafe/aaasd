import { DataTable, Given } from '@badeball/cypress-cucumber-preprocessor';

import { confirmModal } from '../../../../lib/page-objects/common/confirm.modal';
import { messageNotice } from '../../../../lib/page-objects/common/message.notice';
import { newAccountModal } from '../../../../lib/page-objects/trading-servers-manager/components/new-account.modal';
import { customWait } from '../../../../lib/web-socket/server';

Given(`user sees the successful "Generic command" messages`, () => {
    messageNotice.successCheckMessage('Command "Generic command" sent for HerodotusMulti');
});

Given(`user sees a successful robot {string} message`, (command: string) => {
    messageNotice.successCheckMessage(
        `Command "${command}" sent for test_indicator_robot(TestIndicatorRobot|1217)`,
    );
});

Given(`user sees the {string} success message`, (message: string) => {
    messageNotice.successCheckMessage(message);
});

Given(`user sees the {string} error message`, (message: string) => {
    messageNotice.checkErrorMessage(message);
});

Given(`user sees the {string} notification message`, (message: string) => {
    messageNotice.checkNotificationMessage(message);
});

Given(`user selects {string} in the dialog modal`, (robotName: string) => {
    confirmModal.confirmModal.containsClick(robotName);
});

Given(`user sees {string} in the dialog modal`, (robotName: string) => {
    confirmModal.confirmModal.checkVisible();
    const robotNames = robotName.split(',');
    robotNames.forEach((robotName) => confirmModal.confirmModal.get().contains(robotName));
});

Given(`user sees the {string} notice message`, (message: string) => {
    messageNotice.checkNoticeMessage(message);
});

Given(`user sees a modal to confirm the operation`, () => {
    confirmModal.confirmModal.checkVisible();
});

Given(`user sees {string} in the {string} modal`, (names: string, nameModal: string) => {
    const nameList = names.split(',');
    confirmModal.checkContainModal(nameList);
    confirmModal.confirmModal.checkContain(nameModal);
});

Given(`user sees values in the {string} modal:`, (nameModal: string, dataTable: DataTable) => {
    dataTable.rows().forEach((name) => {
        confirmModal.checkContainModal(name);
    });
    confirmModal.confirmModal.checkContain(nameModal);
});

Given(`user sees the {string} modal`, (nameModal: string) => {
    confirmModal.confirmModal.checkContain(nameModal);
});

Given(`user not sees the {string} modal`, () => {
    confirmModal.confirmModal.checkNotExists();
});

Given(`user selects {string} in the network selectors`, (nameItem: string) => {
    confirmModal.itemSelector.clickByText(nameItem);
});

Given(`user sets the {string} in the "coin filter" setting`, (nameTab: string) => {
    const namesTabs = nameTab.split(',');
    confirmModal.removeTabsCoinFilterButton.checkVisible();
    confirmModal.removeTabsCoinFilterButton.click();
    customWait(0.5);
    confirmModal.setTabsCoinFilter(namesTabs);
});

Given(
    `user clicks on the {string} button in the {string} modal`,
    (nameButton: string, nameModal: string) => {
        switch (nameButton) {
            case 'Close':
                confirmModal.closeButton.click();
                break;
            case 'Cancel':
                nameModal === 'Creat Account'
                    ? newAccountModal.cancelButton.click()
                    : confirmModal.cancelButton.click();
                break;
            case 'OK':
            case 'Send':
                confirmModal.okButton.lastClick();
                break;
            case 'Save':
                newAccountModal.clickSaveButton();
                break;
        }
    },
);
