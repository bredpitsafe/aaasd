import { Given } from '@badeball/cypress-cucumber-preprocessor';
import { testSelector } from '@frontend/common/e2e';
import { EDashboardPageSelectors } from '@frontend/common/e2e/selectors/dashboard/dashboard.page.selectors';

import { TDashboardData } from '../../../../lib/interfaces/dashboard/dashboardData';
import { THerodotusTradesData } from '../../../../lib/interfaces/herodotus-trades/herodotusTradesData';
import { EPagesUrl } from '../../../../lib/interfaces/url-interfaces';
import {
    confirmModal,
    EConfirmModalSelectors,
} from '../../../../lib/page-objects/common/confirm.modal';
import { dialogModal } from '../../../../lib/page-objects/common/dialog.modal';
import { mainMenuModal } from '../../../../lib/page-objects/common/main-menu.modal';
import { tableHeader } from '../../../../lib/page-objects/common/table/table.header';
import {
    dashboardPermissionModal,
    EDashboardPermissionModalSelectors,
} from '../../../../lib/page-objects/dashboard/dashbaord.permission.modal';
import { dashboardChooseMenu } from '../../../../lib/page-objects/dashboard/dashboard.choose.menu';
import { dashboardEditModal } from '../../../../lib/page-objects/dashboard/dashboard.edit.modal';
import { dashboardPage } from '../../../../lib/page-objects/dashboard/dashboard.page';
import { customWait } from '../../../../lib/web-socket/server';
import { checkUrlInclude } from '../../../asserts/comon-url-assert';
import { getDataFocusToDashboard } from '../../../data/dashboard/getDataFocusToDashboard';
import { getDataIndicatorsDashboard } from '../../../data/dashboard/getDataIndicatorDashboard';
import { getDataRobotDashboard } from '../../../data/dashboard/getDataRobotDashboard';
import { getDataRobotTaskDashboard } from '../../../data/dashboard/getDataRobotTaskDashboard';
import { getDataServerDashboard } from '../../../data/dashboard/getDataServerDashboard';
import { getDataRobotTaskT0071 } from '../../../data/herodotus-terminal/getDataRobotTaskT0071';
import { getDataRobotTaskT0158 } from '../../../data/herodotus-terminal/getDataRobotTaskT0158';
import { getDataTradesT0071 } from '../../../data/herodotus-terminal/getDataTradesT0071';
import { getDataTradesT0525 } from '../../../data/herodotus-terminal/getDataTradesT0525';
import { getRandomNumber, getUuid } from '../../../data/random';

Given(`user goes to the "Dashboard" page`, () => {
    dashboardPage.visit();
});

Given(
    `user sees a modal dialog with the name {string} from the file and clicks Enter`,
    (DashboardName: string) => {
        dialogModal.checkElementsExists();
        dialogModal.nameInput.checkHaveValue(DashboardName);
        dialogModal.nameInput.type('{enter}');
    },
);

Given(`user sees the menu on the "Dashboard" page`, () => {
    dashboardPage.checkMenuVisible();
});

Given(`user sees {string} text on the "Dashboard" page`, (text: string) => {
    dashboardPage.mainTitleText.checkContain(text);
});

Given(`user sees the name of the columns in the table`, () => {
    dashboardPage.mainTitleText.checkContain('Custom View Table');
    dashboardPage.checkDataHeaderTable();
});

Given(`user opens this "Dashboard" in the page`, () => {
    dialogModal.checkElementsVisible();
    dialogModal.thisWindowButton.click();
});

Given(`user imports a file with {string} name`, (fileName: string) => {
    dashboardPage.importFileInput.uploadFile(fileName);
    dialogModal.checkElementsVisible();
});

Given(`user clicks on the "Dashboard" button in the menu`, () => {
    dashboardPage.selectDashboardButton.click();
});

Given(
    `user checks visibility of the "Dashboard" card with the {string} name`,
    (DashboardName: string) => {
        dashboardChooseMenu.tableBody.checkContain(DashboardName);
    },
);

Given(
    `user goes to the "Dashboard" page from {string}`,
    (nameDashboard: string, data: TDashboardData) => {
        switch (nameDashboard) {
            case 'RobotDashboard':
                data = getDataRobotDashboard();
                break;
            case 'Indicators':
                data = getDataIndicatorsDashboard();
                break;
            case 'RobotTaskDashboard':
                data = getDataRobotTaskDashboard();
                break;
            case 'Server':
                data = getDataServerDashboard();
                break;
        }
        cy.visit(EPagesUrl.dashboard + data.URL);
    },
);

Given(`user goes to the "Dashboard" page at link by id {string}`, (nameDashboard: string) => {
    cy.visit(`${EPagesUrl.dashboard}/dashboard?storageId=${nameDashboard}`);
});

Given(`user goes to the dashboard with the "focusTo" parameter`, () => {
    const data = getDataFocusToDashboard();
    cy.visit(EPagesUrl.dashboard + data.URL);
});

Given(`user sees the correct Date parameter`, () => {
    dashboardPage.doScreenshot('focusTo');
});

Given(`user goes to the "Dashboard" page of the task with id {string}`, (numberTask: string) => {
    let data: TDashboardData;
    switch (numberTask) {
        case '71':
            data = getDataRobotTaskT0071();
            break;
        case '158':
            data = getDataRobotTaskT0158();
            break;
    }
    cy.visit(EPagesUrl.dashboard + data.URL);
});

Given(
    `user goes to the "Herodotus Trades" page of the task with id {string}`,
    (numberTask: string) => {
        let data: THerodotusTradesData;
        switch (numberTask) {
            case '71':
                data = getDataTradesT0071();
                break;
            case '525':
                data = getDataTradesT0525();
                break;
        }
        cy.visit(EPagesUrl.herodotusTrades + data.URL);
    },
);

Given(`user sees the task legend with id {string}`, (numberTask: string) => {
    let data: TDashboardData;
    switch (numberTask) {
        case '71':
            data = getDataRobotTaskT0071();
            break;
        case '158':
            data = getDataRobotTaskT0158();
            break;
    }
    dashboardPage.checkVisibleLabels(data);
});

Given(
    `user sees labels and headers {string} "Dashboard"`,
    (nameDashboard: string, data: TDashboardData) => {
        switch (nameDashboard) {
            case 'RobotDashboard':
                data = getDataRobotDashboard();
                dashboardPage.checkVisibleLabels(data);
                break;
            case 'RobotTaskDashboard':
                data = getDataRobotTaskDashboard();
                dashboardPage.checkVisibleLabels(data);
                break;
            case 'Indicators':
                data = getDataIndicatorsDashboard();
                dashboardPage.checkVisibleIndicatorLabels(data);
                break;
            case 'Server':
                data = getDataServerDashboard();
                dashboardPage.checkVisiblePanel(data);
                dashboardPage.checkVisibleLabels(data);
                break;
        }
    },
);

Given(`user sees the {string} indicator in the "Dashboard" page`, (nameIndicator: string) => {
    dashboardPage.chartLegends.contains(nameIndicator);
});

Given(`user selects the "Config" of the panel`, () => {
    dashboardPage.panelButton.get().eq(1).click();
});

Given(`user selects the "View" of the panel`, () => {
    dashboardPage.panelButton.get().eq(0).click();
});

Given(`user types a {string} into the field`, (nameFile: string) => {
    dashboardPage.panelInput.clear();
    dashboardPage.setConfig(nameFile);
});

Given(`user sees indicators and colored rows`, () => {
    dashboardPage.checkContainColorRow();
    dashboardPage.checkIndicatorColumnNotEmpty();
});

Given(`user sees the value of the columns in the grid`, () => {
    dashboardPage.checkDataHeaderGrid();
    dashboardPage.checkDataBodyGrid();
});

Given(`user sees data {string} panel on the "Dashboard" page`, (namePamel: string) => {
    switch (namePamel) {
        case 'Grid Custom View':
            dashboardPage.checkGridValue();
            break;
        case 'Table Custom View':
            dashboardPage.checkTableValue();
            break;
    }
});

Given(`user clicks on the {string} button in the "Choose dashboard" menu`, (nameButton: string) => {
    switch (nameButton) {
        case 'Close':
            dashboardChooseMenu.closeDashboardChooseMenuButton.click();
            break;
        case 'Add':
            dashboardChooseMenu.addDashboardButton.click();
            break;
    }
});

Given(`user sees that all buttons are disabled in the menu`, () => {
    dashboardPage.checkAllButtonsDisabled();
});

Given(`user sees that all buttons are enabled in the menu`, () => {
    dashboardPage.checkAllButtonsEnabled();
});

Given(`user sees that "Save Changes" and "Revert Changes" buttons are disabled in the menu`, () => {
    dashboardPage.checkSaveAndRevertButtonsDisabled();
});

Given(`sets the {string} in the "BFF Stage" setting`, (nameSettings: string) => {
    mainMenuModal.openSettingsButton.click();
    confirmModal.confirmModal.checkContain('Settings');
    confirmModal.confirmModal.containsClick('Advanced');
    confirmModal.bffStageSelector.typeAndClickByText(nameSettings);
    confirmModal.closeButton.click();
});

Given(`user clicks on the "Add Layout" button in the "Set Layout" popover`, () => {
    dashboardPage.addLayoutNameButton.click();
});

Given(`user clicks on the {string} button menu on the "Dashboard" page`, (nameButton: string) => {
    switch (nameButton) {
        case 'Set Layout':
            dashboardPage.setLayoutButton.click();
            break;
        case 'Edit Dashboard':
            dashboardPage.editDashboardButton.click();
            break;
        case 'Save Changes':
            dashboardPage.saveChangesButton.click();
            break;
        case 'Select Dashboard':
            dashboardPage.selectDashboardButton.click();
            break;
        case 'Revert Changes':
            dashboardPage.revertChangesButton.click();
            break;
        case 'Share Dashboard':
            dashboardPage.shareDashboardButton.click();
            break;
        case 'Sync Mode':
            dashboardPage.toggleSyncModButton.click();
            break;
        case 'Compact Mode':
            dashboardPage.toggleCompactModeButton.click();
            break;
    }
});

Given(
    `user clicks on the "Import Dashboard" button menu on the "Dashboard" page and selects {string} file`,
    (nameFile: string) => {
        dashboardPage.importFileInput.uploadFile(nameFile);
    },
);

Given(
    `user selects {string} in the context menu from the {string}`,
    (nameItem: string, nameDashboard: string) => {
        dashboardChooseMenu.selectContextItemByName(nameDashboard, nameItem);
    },
);

Given(`user sees the {string} layouts on the "Dashboard" page`, (nameLayout: string) => {
    dashboardPage.checkLayout(nameLayout);
});

Given(`user sees an indicator that the "Sync Mode" is on`, () => {
    dashboardPage.toggleSyncModButton
        .get()
        .should('have.css', 'background-color', 'rgb(22, 119, 255)');
});

Given(
    `user sees the values {string} Width and {string} Height the dashboard card`,
    (widthValue: string, heightValue: string) => {
        dashboardPage.checkWidthHeightCard(widthValue, heightValue);
    },
);

Given(`user sees the {string} layouts on the "Dashboard" page`, (nameLayout: string) => {
    dashboardPage.checkLayout(nameLayout);
});

Given(`user sees a new {string} layout on the "Dashboard" page`, (nameLayout: string) => {
    dashboardPage.checkVisibleLayout(nameLayout);
});

Given(`user sees the "Edit Dashboard" modal a {string} panel dashboard`, (namePanel: string) => {
    dashboardEditModal.checkVisibleEditConfigForm(namePanel);
});

Given(
    `user sees the {string} in {string} column of "Permission" table`,
    (value: string, nameFilter: string) => {
        switch (nameFilter) {
            case 'User':
                dashboardPermissionModal.userRowText.checkVisible();
                dashboardPermissionModal.checkAllRowsContainUser(value);
                break;
            case 'Nickname':
                dashboardPermissionModal.nicknameRowText.checkVisible();
                dashboardPermissionModal.checkAllRowsContainNickname(value);
                break;
            case 'Permission':
                dashboardPermissionModal.checkAllRowsContainPermission(value);
                break;
        }
    },
);

Given(`user not sees the {string} in {string} column of "Permission" table`, (nameUser: string) => {
    confirmModal.confirmModal.checkNotContain(nameUser);
});

Given(
    `user clicks on the "Set Layout" button and selects {string} in the menu "Dashboard" page`,
    (nameButton: string) => {
        dashboardPage.setLayoutButton.click();
        dashboardPage.setLayoutItems.checkVisible();
        dashboardPage.setLayoutItems.containsClick(nameButton);
        dashboardPage.setLayoutButton.click();
    },
);

Given(
    `user clicks on the "Add Panel" button and selects {string} in the menu "Dashboard" page`,
    (nameItem: string) => {
        dashboardPage.addPanelButton.click();
        dashboardPage.setPanelItem.containsClick(nameItem);
    },
);

Given(
    `user clicks on the "Export and Clone" button and selects {string} in the menu "Dashboard" page`,
    (value: string) => {
        dashboardPage.exportCloneButton.click();
        dashboardPage.setPanelItem.containsClick(value);
    },
);

Given(`user sees the {string} label in the "Dashboard" page`, (nameText: string) => {
    dashboardPage.mainTitleText.checkContain(nameText);
});

Given(`user sees the "Choose dashboard" menu in the "Dashboard" page`, () => {
    dashboardChooseMenu.checkVisibleMenu();
});

Given(`user not sees the "Choose dashboard" menu in the "Dashboard" page`, () => {
    dashboardChooseMenu.checkNotVisibleMenu();
});

Given(`user sees the "Close" button in the "Choose dashboard" menu`, () => {
    dashboardChooseMenu.closeDashboardChooseMenuButton.checkVisible();
});

Given(`checks that the "Choose dashboard" menu cannot be hidden`, () => {
    dashboardChooseMenu.checkVisibleMenu();
});

Given(`user sees the {string} in the "Choose dashboard" menu`, (nameText: string) => {
    dashboardChooseMenu.dashboardChooseMenuList.checkContain(nameText);
});

Given(`user not sees the "New Dashboard" in the "Choose dashboard" menu`, (nameText: string) => {
    dashboardChooseMenu.dashboardChooseMenuList.checkNotContain(nameText);
});

Given(
    `user deletes all {string} the "Choose dashboard" menu in the "Dashboard" page`,
    (nameDashboard: string) => {
        dashboardChooseMenu.deleteAllDashboardByName(nameDashboard);
    },
);

Given(`user types a random value in the "New Dashboard" name`, () => {
    const random = getUuid();
    dashboardChooseMenu.dashboardNameInput.type(random);
    dashboardChooseMenu.dashboardNameInput.type('{enter}');
    cy.wrap(random).as('randomName');
});

Given(`user not change the name but presses "Enter" in the input field`, () => {
    dashboardChooseMenu.dashboardNameInput.type('{enter}');
});

Given(`user sees the "random" name "Dashboard" in the "Choose dashboard" menu`, () => {
    cy.get('@randomName').then((object) => {
        const randomName = object as unknown as string;
        dashboardChooseMenu.dashboardChooseMenuList.contains(randomName);
    });
});

Given(
    `user types {string} in the "Permission" {string} filter`,
    (nameUser: string, nameInput: string) => {
        switch (nameInput) {
            case 'User':
                dashboardPermissionModal.permissionUserInput.clearTypeTextAndEnter(nameUser);
                break;
            case 'Nickname':
                dashboardPermissionModal.permissionNicknameInput.clearTypeTextAndEnter(nameUser);
                break;
        }
        customWait(1);
    },
);

Given(`user checks that the {string} user not have dashboard permissions`, (nameUser: string) => {
    dashboardPage.shareDashboardButton.checkVisible();
    cy.get(testSelector(EDashboardPageSelectors.App)).then(($body) => {
        if ($body.find(EDashboardPermissionModalSelectors.PermissionIcon).length > 0) {
            dashboardPage.shareDashboardButton.click();
            dashboardPermissionModal.permissionUserInput.clearTypeTextAndEnter(nameUser);
            customWait(0.5);
            dashboardPermissionModal.permissionRowText.containsClick('None'.charAt(0));
            confirmModal.clickOkButton();
        }
    });
});

Given(
    `user selects the {string} Permission filter in the context menu table`,
    (nameFilter: string) => {
        dashboardPermissionModal.setsPermissionFilter(nameFilter);
        customWait(1);
    },
);

Given(
    `user type "newuser" in the "User name" added input "Change dashboard permissions" modal`,
    () => {
        dashboardPermissionModal.userAddButton.checkNotEnabled();
        dashboardPermissionModal.userAddNameInput.type('newuser');
    },
);

Given(`user checks that the "Show only active permissions" switch is turned off`, () => {
    dashboardPermissionModal.showPermissionsSwitch.checkVisible();
    cy.get(EConfirmModalSelectors.ConfirmModal).then(($body) => {
        if ($body.find(EDashboardPermissionModalSelectors.PermissionsSwitchOn).length > 0) {
            dashboardPermissionModal.showPermissionsSwitch.click();
            customWait(0.5);
        }
    });
});

Given(`user checks that the "Show only active permissions" switch is turned on`, () => {
    dashboardPermissionModal.showPermissionsSwitch.checkVisible();
    dashboardPermissionModal.permissionsSwitchOn.checkVisible();
});

Given(
    `user clicks "Show only active permissions" switch in the "Change dashboard permissions" modal`,
    () => {
        dashboardPermissionModal.showPermissionsSwitch.click();
        customWait(0.5);
    },
);

Given(`user clicks on the "delete" icon near "newuser" name of "Permission" table`, () => {
    dashboardPermissionModal.deleteUserIcon.click();
    customWait(1);
});

Given(`user sees users with sets permissions in the "Change dashboard permissions" modal`, () => {
    dashboardPermissionModal.checkAllRowsContainColorPermission();
});

Given(
    `user sets {string} permission in the "Change dashboard permissions" modal`,
    (namePermission: string) => {
        dashboardPermissionModal.permissionRowText.containsClick(namePermission.charAt(0));
        confirmModal.clickOkButton();
    },
);

Given(
    /user (sees|not sees) "Share" icon near "Share Dashboard" button in the menu "Dashboard" page/,
    (checkContain: string) => {
        switch (checkContain) {
            case 'sees':
                dashboardPermissionModal.permissionIcon.checkContain('1');
                break;
            case 'not sees':
                dashboardPermissionModal.permissionIcon.checkNotVisible();
                break;
        }
    },
);

Given(`user sees that the icon near "Share Dashboard" has a value of {string}`, (value: string) => {
    dashboardPermissionModal.permissionIcon.checkContain(value);
});

Given(`user not sees "Panel Dashboard" menu on the {string} dashboard`, () => {
    dashboardPage.checkNotVisiblePanelMenu();
    dashboardPage.toggleCompactModeButton
        .get()
        .should('have.css', 'background-color', 'rgb(22, 119, 255)');
});

Given(
    /user (sees|not sees) a "star" icon near "New Dashboard" name in the "Choose dashboard" menu/,
    (checkContain: string) => {
        switch (checkContain) {
            case 'sees':
                cy.contains('New Dashboard').should(
                    'have.attr',
                    'title',
                    'Dashboard has unsaved changes',
                );
                break;
            case 'not sees':
                cy.contains('New Dashboard').should(
                    'not.have.attr',
                    'title',
                    'Dashboard has unsaved changes',
                );
                break;
        }
    },
);

Given(
    /user (sees|not sees) the "Share Dashboard" button in the menu "Dashboard" page/,
    (checkContain: string) => {
        switch (checkContain) {
            case 'sees':
                dashboardPage.shareDashboardButton.checkVisible();
                break;
            case 'not sees':
                dashboardPage.shareDashboardButton.checkNotExists();
                break;
        }
    },
);

Given(`user sets a random number value in the "Set Backtesting" input`, () => {
    const random = getRandomNumber(10, 100);
    dashboardPage.setBacktestingInput.type(random.toString());
    dashboardPage.selectDashboardButton.click();
    cy.wrap(random).as('backtesting');
});

Given(`user types a random name in the "Layout name" input`, () => {
    const random = getRandomNumber(100, 1000).toString();
    dashboardPage.layoutNameInput.type(`layoutName_${random}`);
    cy.wrap(random).as('layoutName');
});

Given(`user types a random name in the "Layout name" input and click "Enter"`, () => {
    const random = getRandomNumber(100, 1000).toString();
    dashboardPage.layoutNameInput.type(`layoutName_${random}`);
    dashboardPage.layoutNameInput.type('{enter}');
    cy.wrap(random).as('layoutName');
});

Given(`user sees a random backtesting value in the menu`, () => {
    cy.get('@backtesting').then((object) => {
        const backtesting = object as unknown as string;
        dashboardPage.mainMenuBar.checkContain(`BTRun`);
        dashboardPage.mainMenuBar.checkContain(`${backtesting}`);
    });
});

Given(`user sees a random backtesting value in the URL page`, () => {
    cy.get('@backtesting').then((object) => {
        const backtesting = object as unknown as string;
        checkUrlInclude(`&backtestingId=${backtesting}`);
    });
});

Given(`user sees a random name in the "Set Layout" popover`, () => {
    cy.get('@layoutName').then((object) => {
        const layoutName = object as unknown as string;
        dashboardPage.setLayoutPopover.checkContain(layoutName);
    });
});

Given(`user not sees a random name in the "Set Layout" popover`, () => {
    cy.get('@layoutName').then((object) => {
        const layoutName = object as unknown as string;
        dashboardPage.setLayoutPopover.checkNotContain(layoutName);
    });
});

Given(`user clicks on the "Delete Layout" button in the "Set Layout" popover`, () => {
    dashboardPage.deleteLayoutIcon.click();
});

Given(`user sees a "Set Layout" popover on the "Dashboard" page`, () => {
    dashboardPage.checkVisibleSetLayoutPopover();
});

Given(`user selects the {string} form in the "Edit Dashboard" modal`, (nameEditor: string) => {
    confirmModal.confirmModal.containsClick(nameEditor);
});

Given(`user sees the {string} form in the "Edit Dashboard" modal`, (nameEditor: string) => {
    switch (nameEditor) {
        case 'Config':
            dashboardEditModal.checkVisibleEditConfigForm('Chart');
            break;
        case 'Chart':
            dashboardEditModal.checkVisibleEditChartForm();
            break;
    }
});

Given(`user clicks on the {string} button in the "Charts" form`, (nameButton: string) => {
    switch (nameButton) {
        case 'Add Panel':
            dashboardEditModal.panelPlusIconButton.click();
            break;
        case 'Apply':
            dashboardEditModal.applyChartsButton.click();
            break;
        case 'Discard':
            dashboardEditModal.discardChartsButton.click();
            break;
    }
});

Given(`user types a {string} value in the "Panel" in the "Charts" form`, (valuePanel: string) => {
    dashboardEditModal.inputQueryPanel.get().eq(1).clear();
    dashboardEditModal.inputQueryPanel.get().eq(1).type(valuePanel, {
        parseSpecialCharSequences: false,
    });
    customWait(3);
});

Given(`user types a random value in the "Config" input in the "Edit Dashboard" modal`, () => {
    const random = getUuid();
    dashboardEditModal.configInput.clickForce();
    dashboardEditModal.configInput.get().type(random, { force: true, delay: 0 });
    cy.wrap(random).as('configValue');
});

Given(
    `user types a {string} config in the "Config" input in the "Edit Dashboard" modal`,
    (nameFile: string) => {
        dashboardEditModal.configInput.clickForce();
        dashboardEditModal.configInput.clear();
        dashboardEditModal.setConfig(`cypress/fixtures/dashboard/${nameFile}`);
    },
);

Given(/user (sees|not sees) the typed random value in the "Config" form/, (value: string) => {
    cy.get('@configValue').then((object) => {
        const config = object as unknown as string;
        switch (value) {
            case 'not sees':
                dashboardEditModal.configForm.checkNotContain(config);
                break;
            case 'sees':
                dashboardEditModal.configForm.contains(config);
                break;
        }
    });
});

Given(/user (sees|not sees) the active elements in the "Config" form/, (value: string) => {
    switch (value) {
        case 'not sees':
            dashboardEditModal.checkElementsNotEnable();
            break;
        case 'sees':
            dashboardEditModal.checkElementsEnable();
            break;
    }
});

Given(/user (sees|not sees) the active elements in the "Charts" form/, (value: string) => {
    switch (value) {
        case 'not sees':
            dashboardEditModal.checkElementsChartsNotEnable();
            break;
        case 'sees':
            dashboardEditModal.checkElementsChartsEnable();
            break;
    }
});

Given(
    /user (sees|not sees) a new panel in the "Charts" form in the "Edit Dashboard" modal/,
    (value: string) => {
        switch (value) {
            case 'not sees':
                tableHeader.tableRowText.get().eq(0).should('be.visible');
                tableHeader.tableRowText.get().eq(1).should('not.be.visible');
                break;
            case 'sees':
                tableHeader.tableRowText.get().eq(0).should('be.visible');
                tableHeader.tableRowText.get().eq(1).should('be.visible');
                break;
        }
    },
);
