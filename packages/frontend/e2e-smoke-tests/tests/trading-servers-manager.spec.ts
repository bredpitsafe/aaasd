import { expect, test } from '@playwright/test';
import { TestInfo } from 'playwright/test';

import { takeSnapshotsAndComparison } from '../helpers/checks/takeSnapshotsAndComparison';
import { authorization } from '../helpers/modules/authorization';
import { openTwoPagesByParams } from '../helpers/modules/openTwoPagesByParams';
import { setLogs } from '../helpers/modules/setLogs';
import { EAppUrl } from '../interfaces/app-interfaces';
import { EServerUrl } from '../interfaces/server-interfaces';
import { EServerId } from '../interfaces/serverId-interfaces';
import { ETabUrl } from '../interfaces/tab-interfaces';

const { launchBrowser } = require('../helpers/modules/launchBrowser');
const nameApp = 'trading-servers-manager';

test('Checking the visibility of the "Trading Servers Manager" app with "Indicators" tab', async ({}) => {
    const { browser, context } = await launchBrowser();
    const newPage = await context.newPage();
    const stablePage = await context.newPage();

    await authorization(newPage);

    await openTwoPagesByParams(newPage, stablePage, {
        appUrl: EAppUrl.tradingServersManager,
        serverUrl: EServerUrl.perf,
        serverId: EServerId.perf,
        tabUrl: ETabUrl.indicators,
    });

    const areEqual = await takeSnapshotsAndComparison(
        newPage,
        stablePage,
        nameApp,
        'indicators',
        50,
    );
    expect(areEqual).toBe(true);

    await browser.close();
});

test('Checking the visibility of the "Trading Servers Manager" app with "Instruments" tab', async ({}) => {
    const { browser, context } = await launchBrowser();
    const newPage = await context.newPage();
    const stablePage = await context.newPage();

    await authorization(newPage);

    await openTwoPagesByParams(newPage, stablePage, {
        appUrl: EAppUrl.tradingServersManager,
        serverUrl: EServerUrl.preprod,
        serverId: EServerId.preprod,
        tabUrl: ETabUrl.instruments,
    });

    const areEqual = await takeSnapshotsAndComparison(newPage, stablePage, nameApp, 'instruments');
    expect(areEqual).toBe(true);

    await browser.close();
});

test('Checking the visibility of the "Trading Servers Manager" app with "Virtual Accounts" tab', async ({}) => {
    const { browser, context } = await launchBrowser();
    const newPage = await context.newPage();
    const stablePage = await context.newPage();

    await authorization(newPage);

    await openTwoPagesByParams(newPage, stablePage, {
        appUrl: EAppUrl.tradingServersManager,
        serverUrl: EServerUrl.preprod,
        serverId: EServerId.preprod,
        tabUrl: ETabUrl.virtualAccounts,
    });

    const areEqual = await takeSnapshotsAndComparison(
        newPage,
        stablePage,
        nameApp,
        'virtual-accounts',
    );
    expect(areEqual).toBe(true);

    await browser.close();
});

test('Checking the visibility of the "Trading Servers Manager" app with "Real Accounts" tab', async ({}) => {
    const { browser, context } = await launchBrowser();
    const newPage = await context.newPage();
    const stablePage = await context.newPage();

    await authorization(newPage);

    await openTwoPagesByParams(newPage, stablePage, {
        appUrl: EAppUrl.tradingServersManager,
        serverUrl: EServerUrl.preprod,
        serverId: EServerId.preprod,
        tabUrl: ETabUrl.realAccounts,
    });

    const areEqual = await takeSnapshotsAndComparison(
        newPage,
        stablePage,
        nameApp,
        'real-accounts',
    );
    expect(areEqual).toBe(true);

    await browser.close();
});

test('Checking the visibility of the "Trading Servers Manager" app with "Product Logs" tab', async ({}) => {
    const { browser, context } = await launchBrowser();
    const newPage = await context.newPage();
    const stablePage = await context.newPage();

    await authorization(newPage);

    await openTwoPagesByParams(newPage, stablePage, {
        appUrl: EAppUrl.tradingServersManager,
        serverUrl: EServerUrl.qa,
        serverId: EServerId.qa,
        tabUrl: ETabUrl.productLogs,
    });

    const areEqual = await takeSnapshotsAndComparison(
        newPage,
        stablePage,
        nameApp,
        'product-logs',
        50,
    );
    expect(areEqual).toBe(true);

    await browser.close();
});

test('Checking the visibility of the "Trading Servers Manager" app with "Order Book" tab', async ({}) => {
    const { browser, context } = await launchBrowser();
    const newPage = await context.newPage();
    const stablePage = await context.newPage();

    await authorization(newPage);

    await openTwoPagesByParams(newPage, stablePage, {
        appUrl: EAppUrl.tradingServersManager,
        serverUrl: EServerUrl.preprod,
        serverId: EServerId.preprod,
        tabUrl: ETabUrl.orderBook,
    });

    const areEqual = await takeSnapshotsAndComparison(newPage, stablePage, nameApp, 'order-book');
    expect(areEqual).toBe(true);

    await browser.close();
});

test('Checking the visibility of the "Trading Servers Manager" app with "Position" tab', async ({}) => {
    const { browser, context } = await launchBrowser();
    const newPage = await context.newPage();
    const stablePage = await context.newPage();

    await authorization(newPage);

    await openTwoPagesByParams(newPage, stablePage, {
        appUrl: EAppUrl.tradingServersManager,
        serverUrl: EServerUrl.preprod,
        serverId: EServerId.preprod,
        tabUrl: ETabUrl.position,
    });

    const areEqual = await takeSnapshotsAndComparison(newPage, stablePage, nameApp, 'position');
    expect(areEqual).toBe(true);

    await browser.close();
});

test('Checking the visibility of the "Trading Servers Manager" app with "Balances" tab', async ({}) => {
    const { browser, context } = await launchBrowser();
    const newPage = await context.newPage();
    const stablePage = await context.newPage();

    await authorization(newPage);

    await openTwoPagesByParams(newPage, stablePage, {
        appUrl: EAppUrl.tradingServersManager,
        serverUrl: EServerUrl.preprod,
        serverId: EServerId.preprod,
        tabUrl: ETabUrl.balances,
    });

    const areEqual = await takeSnapshotsAndComparison(newPage, stablePage, nameApp, 'balances');
    expect(areEqual).toBe(true);

    await browser.close();
});

test('Checking the visibility of the "Trading Servers Manager" app with "WS Request" tab', async ({}) => {
    const { browser, context } = await launchBrowser();
    const newPage = await context.newPage();
    const stablePage = await context.newPage();

    await authorization(newPage);

    await openTwoPagesByParams(newPage, stablePage, {
        appUrl: EAppUrl.tradingServersManager,
        serverUrl: EServerUrl.preprod,
        serverId: EServerId.preprod,
        tabUrl: ETabUrl.wsRequest,
    });

    const areEqual = await takeSnapshotsAndComparison(newPage, stablePage, nameApp, 'ws-request');
    expect(areEqual).toBe(true);

    await browser.close();
});

test('Checking the visibility of the "Trading Servers Manager" app with "Config" tab', async ({}) => {
    const { browser, context } = await launchBrowser();
    const newPage = await context.newPage();
    const stablePage = await context.newPage();

    await authorization(newPage);

    await openTwoPagesByParams(newPage, stablePage, {
        appUrl: EAppUrl.tradingServersManager,
        serverUrl: EServerUrl.hypercube,
        serverId: EServerId.hypercube,
        robotId: 'robot/4017',
        tabUrl: ETabUrl.config,
    });

    const areEqual = await takeSnapshotsAndComparison(newPage, stablePage, nameApp, 'robot-config');
    expect(areEqual).toBe(true);

    await browser.close();
});

test('Checking the visibility of the "Trading Servers Manager" app with "State" tab', async ({}) => {
    const { browser, context } = await launchBrowser();
    const newPage = await context.newPage();
    const stablePage = await context.newPage();

    await authorization(newPage);

    await openTwoPagesByParams(newPage, stablePage, {
        appUrl: EAppUrl.tradingServersManager,
        serverUrl: EServerUrl.hypercube,
        serverId: EServerId.hypercube,
        robotId: 'robot/4017',
        tabUrl: ETabUrl.state,
    });

    const areEqual = await takeSnapshotsAndComparison(newPage, stablePage, nameApp, 'robot-state');
    expect(areEqual).toBe(true);

    await browser.close();
});

test('Checking the visibility of the "Trading Servers Manager" app with "Custom View" tab', async ({}) => {
    const { browser, context } = await launchBrowser();
    const newPage = await context.newPage();
    const stablePage = await context.newPage();

    await authorization(newPage);

    await openTwoPagesByParams(newPage, stablePage, {
        appUrl: EAppUrl.tradingServersManager,
        serverUrl: EServerUrl.hypercube,
        serverId: EServerId.hypercube,
        robotId: 'robot/4017',
        tabUrl: ETabUrl.customView,
    });

    const areEqual = await takeSnapshotsAndComparison(
        newPage,
        stablePage,
        nameApp,
        'robot-custom-view',
    );
    expect(areEqual).toBe(true);

    await browser.close();
});

test('Checking the visibility of the "Trading Servers Manager" app with "Active Orders" tab', async ({}) => {
    const { browser, context } = await launchBrowser();
    const newPage = await context.newPage();
    const stablePage = await context.newPage();

    await authorization(newPage);

    await openTwoPagesByParams(newPage, stablePage, {
        appUrl: EAppUrl.tradingServersManager,
        serverUrl: EServerUrl.preprod,
        serverId: EServerId.preprod,
        robotId: 'robot/5917',
        tabUrl: ETabUrl.activeOrders,
    });

    const areEqual = await takeSnapshotsAndComparison(
        newPage,
        stablePage,
        nameApp,
        'robot-active-orders',
        30,
    );
    expect(areEqual).toBe(true);

    await browser.close();
});

test('Checking the visibility of the "Trading Servers Manager" app with "Robot Command" tab', async ({}) => {
    const { browser, context } = await launchBrowser();
    const newPage = await context.newPage();
    const stablePage = await context.newPage();

    await authorization(newPage);

    await openTwoPagesByParams(newPage, stablePage, {
        appUrl: EAppUrl.tradingServersManager,
        serverUrl: EServerUrl.hypercube,
        serverId: EServerId.hypercube,
        robotId: 'robot/4017',
        tabUrl: ETabUrl.command,
    });

    const areEqual = await takeSnapshotsAndComparison(
        newPage,
        stablePage,
        nameApp,
        'robot-command',
    );
    expect(areEqual).toBe(true);

    await browser.close();
});

test('Checking the visibility of the "Trading Servers Manager" app with "Status Messages" tab', async ({}) => {
    const { browser, context } = await launchBrowser();
    const newPage = await context.newPage();
    const stablePage = await context.newPage();

    await authorization(newPage);

    await openTwoPagesByParams(newPage, stablePage, {
        appUrl: EAppUrl.tradingServersManager,
        serverUrl: EServerUrl.hypercube,
        serverId: EServerId.hypercube,
        robotId: 'robot/4017',
        tabUrl: ETabUrl.statusMessages,
    });

    const areEqual = await takeSnapshotsAndComparison(
        newPage,
        stablePage,
        nameApp,
        'robot-status-messages',
        50,
    );
    expect(areEqual).toBe(true);

    await browser.close();
});

test('Checking the visibility of the "Trading Servers Manager" app with "Dashboards" tab', async ({}) => {
    const { browser, context } = await launchBrowser();
    const newPage = await context.newPage();
    const stablePage = await context.newPage();

    await authorization(newPage);

    await openTwoPagesByParams(newPage, stablePage, {
        appUrl: EAppUrl.tradingServersManager,
        serverUrl: EServerUrl.hypercube,
        serverId: EServerId.hypercube,
        robotId: 'robot/4017',
        tabUrl: ETabUrl.dashboards,
    });

    const areEqual = await takeSnapshotsAndComparison(
        newPage,
        stablePage,
        nameApp,
        'robot-dashboards',
    );
    expect(areEqual).toBe(true);

    await browser.close();
});

test('Checking the visibility of the "Trading Servers Manager" app with "Active Tasks" tab', async ({}) => {
    const { browser, context } = await launchBrowser();
    const newPage = await context.newPage();
    const stablePage = await context.newPage();

    await authorization(newPage);

    await openTwoPagesByParams(newPage, stablePage, {
        appUrl: EAppUrl.tradingServersManager,
        serverUrl: EServerUrl.hypercube,
        serverId: EServerId.hypercube,
        robotId: 'robot/4017',
        tabUrl: ETabUrl.activeTasks,
    });

    const areEqual = await takeSnapshotsAndComparison(
        newPage,
        stablePage,
        nameApp,
        'robot-active-tasks',
    );
    expect(areEqual).toBe(true);

    await browser.close();
});

test('Checking the visibility of the "Trading Servers Manager" app with "Archived Tasks" tab', async ({}) => {
    const { browser, context } = await launchBrowser();
    const newPage = await context.newPage();
    const stablePage = await context.newPage();

    await authorization(newPage);

    await openTwoPagesByParams(newPage, stablePage, {
        appUrl: EAppUrl.tradingServersManager,
        serverUrl: EServerUrl.hypercube,
        serverId: EServerId.hypercube,
        robotId: 'robot/4017',
        tabUrl: ETabUrl.archivedTasks,
    });

    const areEqual = await takeSnapshotsAndComparison(
        newPage,
        stablePage,
        nameApp,
        'robot-archived-tasks',
    );
    expect(areEqual).toBe(true);

    await browser.close();
});

test('Checking the visibility of the "Trading Servers Manager" app with "Add Task" tab', async ({}) => {
    const { browser, context } = await launchBrowser();
    const newPage = await context.newPage();
    const stablePage = await context.newPage();

    await authorization(newPage);

    await openTwoPagesByParams(newPage, stablePage, {
        appUrl: EAppUrl.tradingServersManager,
        serverUrl: EServerUrl.hypercube,
        serverId: EServerId.hypercube,
        robotId: 'robot/4017',
        tabUrl: ETabUrl.addTask,
    });

    const areEqual = await takeSnapshotsAndComparison(
        newPage,
        stablePage,
        nameApp,
        'robot-add-task',
    );
    expect(areEqual).toBe(true);

    await browser.close();
});

test('Checking the visibility of the "Trading Servers Manager" app with "Robot Positions" tab', async ({}) => {
    const { browser, context } = await launchBrowser();
    const newPage = await context.newPage();
    const stablePage = await context.newPage();

    await authorization(newPage);

    await openTwoPagesByParams(newPage, stablePage, {
        appUrl: EAppUrl.tradingServersManager,
        serverUrl: EServerUrl.hypercube,
        serverId: EServerId.hypercube,
        robotId: 'robot/4017',
        tabUrl: ETabUrl.robotPositions,
    });

    const areEqual = await takeSnapshotsAndComparison(
        newPage,
        stablePage,
        nameApp,
        'robot-robot-positions',
    );
    expect(areEqual).toBe(true);

    await browser.close();
});

test('Checking the visibility of the "Trading Servers Manager" app with "Robot Balances" tab', async ({}) => {
    const { browser, context } = await launchBrowser();
    const newPage = await context.newPage();
    const stablePage = await context.newPage();

    await authorization(newPage);

    await openTwoPagesByParams(newPage, stablePage, {
        appUrl: EAppUrl.tradingServersManager,
        serverUrl: EServerUrl.hypercube,
        serverId: EServerId.hypercube,
        robotId: 'robot/4017',
        tabUrl: ETabUrl.robotBalances,
    });

    const areEqual = await takeSnapshotsAndComparison(
        newPage,
        stablePage,
        nameApp,
        'robot-robot-balances',
    );
    expect(areEqual).toBe(true);

    await browser.close();
});

test.afterEach('Status check', async ({}, testInfo: TestInfo) => {
    if (test.info().retry === 1) {
        if (test.info().status === 'failed') await setLogs(testInfo);
    }
});
