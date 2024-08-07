import { Given } from '@badeball/cypress-cucumber-preprocessor';

import { EPagesName } from '../../../../lib/interfaces/index/index-interfaces';
import { ERobots } from '../../../../lib/interfaces/trading-servers-manager/robots-interfaces';
import { backtestingPage } from '../../../../lib/page-objects/backtesting/backtesting.page';
import { balanceMonitorPage } from '../../../../lib/page-objects/balance-monitor/balance-monitor.page';
import { charterJsonViewerPage } from '../../../../lib/page-objects/charter-json-viewer/charter-json-viewer.page';
import { authenticationPage } from '../../../../lib/page-objects/common/authentication.page';
import { settingsModal } from '../../../../lib/page-objects/common/settings.modal';
import { tableRow } from '../../../../lib/page-objects/common/table/table.row';
import { dashboardPage } from '../../../../lib/page-objects/dashboard/dashboard.page';
import { herodotusTerminalPage } from '../../../../lib/page-objects/herodotus-terminal/herodotus-terminal.page';
import { herodotusTradesPage } from '../../../../lib/page-objects/herodotus-trades/herodotus-trades.page';
import { stonePage } from '../../../../lib/page-objects/index/stone.page';
import { tradingServersManagerPage } from '../../../../lib/page-objects/trading-servers-manager/trading-servers-manager.page';
import { tradingStatsPage } from '../../../../lib/page-objects/trading-stats/trading-stats.page';
import { wsQueryTerminalPage } from '../../../../lib/page-objects/ws-query-terminal/ws-query-terminal.page';
import { customWait } from '../../../../lib/web-socket/server';
import { checkUrlInclude } from '../../../asserts/comon-url-assert';

Given(`user goes to the "Stone" page`, () => {
    stonePage.visit();
    stonePage.checkElementsExists();
});

Given(`user click an the {string} link`, (pageName: EPagesName) => {
    switch (pageName) {
        case EPagesName.dashboard:
            stonePage.dashboard.click();
            break;
        case EPagesName.tradingServersManager:
            stonePage.tradingServersManager.click();
            break;
        case EPagesName.herodotusTerminal:
            stonePage.herodotusTerminal.click();
            break;
        case EPagesName.tradingStats:
            stonePage.tradingStats.click();
            break;
        case EPagesName.backtestingManager:
            stonePage.backtestingManager.click();
            break;
        case EPagesName.jsonCharts:
            stonePage.jsonCharts.click();
            break;
        case EPagesName.balanceMonitor:
            stonePage.balanceMonitor.click();
            break;
        case EPagesName.wsQueryTerminal:
            stonePage.wsQueryTerminal.click();
            break;
    }
});

Given(
    `user on the {string} page with the "default" backend server parameter`,
    (pageName: EPagesName) => {
        switch (pageName) {
            case EPagesName.tradingServersManager:
                tradingServersManagerPage.checkElementsExists();
                break;
            case EPagesName.herodotusTerminal:
                herodotusTerminalPage.checkElementsExists();
                break;
            case EPagesName.tradingStats:
                tradingStatsPage.checkElementsExists();
                break;
            case EPagesName.backtestingManager:
                backtestingPage.checkElementsExists();
                break;
            case EPagesName.balanceMonitor:
                balanceMonitorPage.checkElementsExists();
                break;
        }
    },
);

Given(`user not sees data on the {string} page`, (pageName: EPagesName) => {
    switch (pageName) {
        case EPagesName.tradingServersManager:
            tradingServersManagerPage.checkNotVisibleTabPanel();
            tradingServersManagerPage.checkVisibleLoading();
            break;
        case EPagesName.herodotusTerminal:
            herodotusTerminalPage.checkVisibleTabPanel();
            herodotusTerminalPage.checkTaskTableVisibility(false);
            stonePage.loadingIcon.checkVisible();
            break;
        case EPagesName.backtestingManager:
            backtestingPage.checkNotExistsTask();
            break;
    }
});

Given(`user sees the {string} page`, (pageName: EPagesName) => {
    switch (pageName) {
        case EPagesName.tradingServersManager:
            tradingServersManagerPage.checkVisibleTabPanel();
            checkUrlInclude(tradingServersManagerPage.pageUrl);
            break;
        case EPagesName.herodotusTerminal:
            herodotusTerminalPage.checkVisibleTabPanel();
            herodotusTerminalPage.checkTaskTableVisibility(true);
            checkUrlInclude(herodotusTerminalPage.pageUrl);
            break;
        case EPagesName.tradingStats:
            tradingStatsPage.checkDailyVisibleTable();
            checkUrlInclude(tradingStatsPage.pageUrl);
            break;
        case EPagesName.backtestingManager:
            backtestingPage.checkVisiblePanel();
            checkUrlInclude(backtestingPage.pageUrl);
            break;
        case EPagesName.balanceMonitor:
            balanceMonitorPage.checkVisiblePanel();
            checkUrlInclude(balanceMonitorPage.pageUrl);
            break;
        case EPagesName.dashboard:
            dashboardPage.checkElementsExists();
            checkUrlInclude(dashboardPage.pageUrl);
            break;
        case EPagesName.jsonCharts:
            charterJsonViewerPage.checkElementsExists();
            checkUrlInclude(charterJsonViewerPage.pageUrl);
            break;
        case EPagesName.herodotusTrades:
            herodotusTradesPage.checkElementsExists();
            herodotusTradesPage.checkVisibleTable();
            checkUrlInclude(herodotusTradesPage.pageUrl);
            break;
        case EPagesName.wsQueryTerminal:
            wsQueryTerminalPage.checkElementsExists();
            wsQueryTerminalPage.checkVisibleTab();
            checkUrlInclude(wsQueryTerminalPage.pageUrl);
            break;
    }
});

Given(
    `user goes to the {string} page with the backend server parameter`,
    (pageName: EPagesName) => {
        switch (pageName) {
            case EPagesName.tradingServersManager:
                tradingServersManagerPage.openPageWithBackendServer();
                break;
            case EPagesName.herodotusTerminal:
                herodotusTerminalPage.openPageWithBackendServer();
                break;
            case EPagesName.tradingStats:
                tradingStatsPage.openPageWithBackendServer();
                break;
            case EPagesName.backtestingManager:
                backtestingPage.openPageWithBackendServer();
                break;
            case EPagesName.balanceMonitor:
                balanceMonitorPage.openPageWithBackendServer();
                break;
            case EPagesName.wsQueryTerminal:
                wsQueryTerminalPage.openPageWithBackendServer();
                break;
        }
    },
);

Given(
    `user goes to the {string} page by {string} server params`,
    (pageName: EPagesName, nameServer: string) => {
        switch (pageName) {
            case EPagesName.tradingServersManager:
                tradingServersManagerPage.openPageByBackendServer(nameServer);
                break;
            case EPagesName.herodotusTerminal:
                herodotusTerminalPage.openPageByBackendServer(nameServer);
                break;
            case EPagesName.tradingStats:
                tradingStatsPage.openPageByBackendServer(nameServer);
                break;
            case EPagesName.backtestingManager:
                backtestingPage.openPageByBackendServer(nameServer);
                break;
            case EPagesName.balanceMonitor:
                balanceMonitorPage.openPageByBackendServer(nameServer);
                break;
        }
    },
);

Given(
    `user goes to the "Backtesting Manager" page with the backend server {string}`,
    (nameServer: string) => {
        backtestingPage.openPageWithBackendServerByParams(nameServer);
    },
);

Given(`user goes to the "Herodotus Terminal" page by index {string}`, (index: string) => {
    herodotusTerminalPage.openPageWithBackendServerByIndex(index);
});

Given(`user goes to the "Herodotus Terminal" page by name {string}`, (robotName: string) => {
    const index = `${ERobots[robotName]}`;
    herodotusTerminalPage.openPageWithBackendServerByIndex(index);
});

Given(`user click "Log Out" button on the {string} page`, () => {
    authenticationPage.clickLogOutButton();
});

Given(`user on the {string} page with the "ModalSettings" modal`, (pageName: EPagesName) => {
    settingsModal.checkElementsExists();
    customWait(1);
    switch (pageName) {
        case EPagesName.tradingServersManager:
            checkUrlInclude(tradingServersManagerPage.pageUrl);
            break;
        case EPagesName.herodotusTerminal:
            checkUrlInclude(herodotusTerminalPage.pageUrl);
            break;
        case EPagesName.tradingStats:
            checkUrlInclude(tradingStatsPage.pageUrl);
            break;
        case EPagesName.backtestingManager:
            checkUrlInclude(backtestingPage.pageUrl);
            break;
    }
});

Given(`user opens the {string} page`, (pageName: EPagesName) => {
    switch (pageName) {
        case EPagesName.dashboard:
            dashboardPage.visit();
            dashboardPage.checkElementsExists();
            break;
        case EPagesName.tradingServersManager:
            tradingServersManagerPage.visit();
            settingsModal.checkElementsExists();
            break;
        case EPagesName.herodotusTerminal:
            herodotusTerminalPage.visit();
            settingsModal.checkElementsExists();
            break;
        case EPagesName.tradingStats:
            tradingStatsPage.visit();
            settingsModal.checkElementsExists();
            break;
        case EPagesName.backtestingManager:
            backtestingPage.visit();
            settingsModal.checkElementsExists();
            break;
        case EPagesName.balanceMonitor:
            balanceMonitorPage.visit();
            settingsModal.checkElementsExists();
            break;
        case EPagesName.wsQueryTerminal:
            wsQueryTerminalPage.visit();
            settingsModal.checkElementsExists();
            break;
    }
});

Given(`user on the "Herodotus Terminal" page of the {string} robot`, (robotName: ERobots) => {
    checkUrlInclude(herodotusTerminalPage.pageUrl);
    herodotusTerminalPage.checkElementsExists();
    checkUrlInclude(`${ERobots[robotName]}`);
});

Given(
    `user types the modal settings with the {string} backend server parameter`,
    (backendServerName: string) => {
        if (backendServerName === 'default') {
            backendServerName = Cypress.env('backendServerName');
        }
        settingsModal.serverSelect.checkVisible();
        customWait(0.5);
        settingsModal.serverSelect.typeAndClickByText(backendServerName);
    },
);

Given(`user gets URL the "Charts" page and opens the page`, () => {
    tableRow.visitPageByLinkInRow();
});
