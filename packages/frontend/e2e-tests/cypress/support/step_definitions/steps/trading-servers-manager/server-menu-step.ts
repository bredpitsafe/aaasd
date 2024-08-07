import { Given } from '@badeball/cypress-cucumber-preprocessor';

import { BasePage } from '../../../../lib/base.page';
import { Table } from '../../../../lib/base/elements/table/table';
import { EServer } from '../../../../lib/interfaces/server/server-interfaces';
import { EGates } from '../../../../lib/interfaces/trading-servers-manager/md-gates-interfaces';
import { ERobots } from '../../../../lib/interfaces/trading-servers-manager/robots-interfaces';
import { contextMenu } from '../../../../lib/page-objects/common/context.menu';
import { tableHeader } from '../../../../lib/page-objects/common/table/table.header';
import { tableRow } from '../../../../lib/page-objects/common/table/table.row';
import { tablesModal } from '../../../../lib/page-objects/trading-servers-manager/tables.modal';
import { tradingServersManagerPage } from '../../../../lib/page-objects/trading-servers-manager/trading-servers-manager.page';
import { customWait } from '../../../../lib/web-socket/server';
import { checkUrlInclude } from '../../../asserts/comon-url-assert';

Given(`user selects {string} component from {string} table`, (name: string, tableName: string) => {
    tradingServersManagerPage.tablesModal.addTabButton.checkVisible();
    let table: Table;
    switch (tableName) {
        case 'Robots':
            table = tradingServersManagerPage.tablesModal.robotsTable;
            break;
        case 'MD Gates':
            table = tradingServersManagerPage.tablesModal.mgGatesTable;
            break;
        case 'Exec Gates':
            table = tradingServersManagerPage.tablesModal.execGatesTable;
            break;
    }
    table.tableHeader.tableName.scrollIntoView();
    table.tableHeader.tableName.checkContain(tableName);
    table.tableBody.getComponentByNameAndClick(name);
    tableHeader.checkNotVisibleLoad();
});

Given(
    `user sees the name {string} in the header of the {string} tables`,
    (name: string, tableName: string) => {
        tradingServersManagerPage.mainTitleText.checkContain(name);
        switch (tableName) {
            case 'Robots':
                checkUrlInclude('robot/');
                break;
            case 'MD Gates':
                checkUrlInclude('gate/');
                break;
            case 'Servers':
                checkUrlInclude(String(EServer[BasePage.backendServerName as EServer]));
                break;
        }
    },
);

Given(`user sees the name {string} in the header`, (name: string) => {
    tradingServersManagerPage.tablesModal.serverTable.checkContain(name);
    checkUrlInclude(String(EServer[BasePage.backendServerName as EServer]));
});

Given(`user adds a new {string} tab`, (nameTab: string) => {
    tablesModal.addTabButton.click();
    tablesModal.addTab(nameTab);
});

Given(
    `user goes on the "Trading Servers Manager" page with the selected {string} in the {string} table`,
    (componentName: string, tableName: string) => {
        switch (tableName) {
            case 'Robots':
                tradingServersManagerPage.openPageRobotComponentByName(
                    componentName as unknown as ERobots,
                );
                break;

            case 'Servers':
                tradingServersManagerPage.openPageServersTapByName(componentName);
                break;
        }
    },
);

Given(
    `user goes on the "Trading Servers Manager" page with the selected {string} tab`,
    (componentName: string) => {
        const updatedComponentName = componentName.replace(/ /g, '%20');
        tradingServersManagerPage.openPageServersTapByName(updatedComponentName);
    },
);

Given(`user {string} the {string} Robot`, (command: string, name: string) => {
    customWait(2);
    tradingServersManagerPage.tablesModal.robotsTable.tableBody.getComponentByNameAndRightClick(
        name,
    );
    switch (command) {
        case 'starts':
            contextMenu.contextMenu.containsClick('Start');
            break;
        case 'stops':
            contextMenu.contextMenu.containsClick('Stop');
            break;
        case 'restart':
            contextMenu.contextMenu.containsClick('Restart');
            break;
        case 'unblock':
            contextMenu.contextMenu.containsClick('Unblock');
            break;
    }
    customWait(1);
});

Given(`user {string} the {string} Exec Gate`, (command: string, name: string) => {
    customWait(2);
    tradingServersManagerPage.tablesModal.execGatesTable.tableBody.getComponentByNameAndRightClick(
        name,
    );
    switch (command) {
        case 'starts':
            contextMenu.contextMenu.containsClick('Start');
            break;
        case 'stops':
            contextMenu.contextMenu.containsClick('Stop');
            break;
        case 'restart':
            contextMenu.contextMenu.containsClick('Restart');
            break;
    }
    customWait(1);
});

Given(`user {string} the {string} MD Gate`, (command: string, name: string) => {
    customWait(2);
    tradingServersManagerPage.tablesModal.mgGatesTable.tableBody.getComponentByNameAndRightClick(
        name,
    );
    switch (command) {
        case 'starts':
            contextMenu.contextMenu.containsClick('Start');
            break;
        case 'stops':
            contextMenu.contextMenu.containsClick('Stop');
            break;
        case 'restart':
            contextMenu.contextMenu.containsClick('Restart');
            break;
    }
    customWait(1);
});

Given(`user sees the context menu of the {string} "Robots" table`, (name: string) => {
    tradingServersManagerPage.tablesModal.robotsTable.tableBody.getComponentByNameAndRightClick(
        name,
    );
    customWait(1);
    tradingServersManagerPage.checkVisibleRobotMenu();
});

Given(`user sees the context menu of the {string} "Exec Gates" table`, (name: string) => {
    tradingServersManagerPage.tablesModal.execGatesTable.tableBody.getComponentByNameAndRightClick(
        name,
    );
    customWait(1);
    tradingServersManagerPage.checkVisibleGateMenu();
});

Given(`user sees the context menu of the {string} "MD Gates" table`, (name: string) => {
    tradingServersManagerPage.tablesModal.mgGatesTable.tableBody.getComponentByNameAndRightClick(
        name,
    );
    customWait(1);
    tradingServersManagerPage.checkVisibleGateMenu();
});

Given(`user {string} the {string} "Exec Gates"`, (command: string, name: string) => {
    tradingServersManagerPage.tablesModal.execGatesTable.tableBody.getComponentByNameAndRightClick(
        name,
    );
    switch (command) {
        case 'starts':
            contextMenu.contextMenu.containsClick('Start');
            break;
        case 'stops':
            contextMenu.contextMenu.containsClick('Stop');
            break;
        case 'restart':
            contextMenu.contextMenu.containsClick('Restart');
            break;
    }
    customWait(1);
});

Given(
    `user goes on the "Trading Servers Manager" page with selected {string} tab of the {string} {string}`,
    (nameTab: string, nameComponent: string, kindComponent: string) => {
        const componentUrls = {
            Robot: (nameComponent: string) => `robot/${ERobots[nameComponent]}?tab=`,
            Gate: (nameComponent: string) => `gate/${EGates[nameComponent]}?tab=`,
        };
        const visitUrl = componentUrls[kindComponent](nameComponent) + nameTab;
        tradingServersManagerPage.visitByTab(visitUrl);
    },
);

Given(`user clicks on the Server`, () => {
    tablesModal.serverTable.containsClick('trading_core:');
});

Given(`user goes on the {string} page`, (namePage: string) => {
    cy.visit(namePage);
    tableRow.checkNotVisibleLoading();
});

Given(`user gets URL the {string} page and opens the page`, (pageType: string) => {
    switch (pageType) {
        case 'Dashboard':
            tableRow.visitPageByLinkInRow();
            break;
        case 'Button Dashboard':
            tableRow.visitPageByLinkInButtonDashboard();
            break;
    }
});

Given(`user sees the {string} icon near the name "Binance"`, (nameIcon: string) => {
    tablesModal.checkVisibleIcon(nameIcon);
});

Given(
    `user sees the {string} status near the name {string} in the {string} table`,
    (nameStatus: string, nameComponent: string, nameTable: string) => {
        tablesModal.checkVisibleStatusComponent(nameStatus, nameComponent, nameTable);
    },
);

Given(
    `user goes on the "Trading Servers Manager" page with the selected {string} tab in the {string} robot`,
    (nameTab: string, nameRobot: string) => {
        tradingServersManagerPage.openPageRobotByTabAndNumberRobot(nameTab, nameRobot);
    },
);
