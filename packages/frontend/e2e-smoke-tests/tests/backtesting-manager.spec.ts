import { expect, test } from '@playwright/test';
import { TestInfo } from 'playwright/test';

import { takeSnapshotsAndComparison } from '../helpers/checks/takeSnapshotsAndComparison';
import { authorization } from '../helpers/modules/authorization';
import { openTwoPagesByParams } from '../helpers/modules/openTwoPagesByParams';
import { setLogs } from '../helpers/modules/setLogs';
import { EAppUrl } from '../interfaces/app-interfaces';
import { EServerUrl } from '../interfaces/server-interfaces';
import { ETabUrl } from '../interfaces/tab-interfaces';

const { launchBrowser } = require('../helpers/modules/launchBrowser');
const nameApp = 'backtesting-manager.spec';
const taskNumber = '1608/5128';

test('Checking the visibility of the "Backtesting Manager" app with "Add Task" tab', async ({}) => {
    const { browser, context } = await launchBrowser();
    const newPage = await context.newPage();
    const stablePage = await context.newPage();

    await authorization(newPage);

    await openTwoPagesByParams(newPage, stablePage, {
        appUrl: EAppUrl.backtestingManager,
        serverUrl: EServerUrl.perf,
        tabUrl: ETabUrl.addTask,
        taskNumber: taskNumber,
    });

    const areEqual = await takeSnapshotsAndComparison(newPage, stablePage, nameApp, 'add-task');
    expect(areEqual).toBe(true);

    await browser.close();
});

test('Checking the visibility of the "Backtesting Manager" app with "Tasks" tab', async ({}) => {
    const { browser, context } = await launchBrowser();
    const newPage = await context.newPage();
    const stablePage = await context.newPage();

    await authorization(newPage);

    await openTwoPagesByParams(newPage, stablePage, {
        appUrl: EAppUrl.backtestingManager,
        serverUrl: EServerUrl.perf,
        tabUrl: ETabUrl.tasks,
        taskNumber: taskNumber,
    });

    const areEqual = await takeSnapshotsAndComparison(newPage, stablePage, nameApp, 'tasks');
    expect(areEqual).toBe(true);

    await browser.close();
});

test('Checking the visibility of the "Backtesting Manager" app with "Dashboards" tab', async ({}) => {
    const { browser, context } = await launchBrowser();
    const newPage = await context.newPage();
    const stablePage = await context.newPage();

    await authorization(newPage);

    await openTwoPagesByParams(newPage, stablePage, {
        appUrl: EAppUrl.backtestingManager,
        serverUrl: EServerUrl.perf,
        tabUrl: ETabUrl.dashboards,
        taskNumber: taskNumber,
    });

    const areEqual = await takeSnapshotsAndComparison(newPage, stablePage, nameApp, 'dashboards');
    expect(areEqual).toBe(true);

    await browser.close();
});

test('Checking the visibility of the "Backtesting Manager" app with "Runs" tab', async ({}) => {
    const { browser, context } = await launchBrowser();
    const newPage = await context.newPage();
    const stablePage = await context.newPage();

    await authorization(newPage);

    await openTwoPagesByParams(newPage, stablePage, {
        appUrl: EAppUrl.backtestingManager,
        serverUrl: EServerUrl.perf,
        tabUrl: ETabUrl.runs,
        taskNumber: taskNumber,
    });

    const areEqual = await takeSnapshotsAndComparison(newPage, stablePage, nameApp, 'runs');
    expect(areEqual).toBe(true);

    await browser.close();
});

test('Checking the visibility of the "Backtesting Manager" app with "Runs Info" tab', async ({}) => {
    const { browser, context } = await launchBrowser();
    const newPage = await context.newPage();
    const stablePage = await context.newPage();

    await authorization(newPage);

    await openTwoPagesByParams(newPage, stablePage, {
        appUrl: EAppUrl.backtestingManager,
        serverUrl: EServerUrl.perf,
        tabUrl: ETabUrl.runsInfo,
        taskNumber: taskNumber,
    });

    const areEqual = await takeSnapshotsAndComparison(newPage, stablePage, nameApp, 'runs-info');
    expect(areEqual).toBe(true);

    await browser.close();
});

test('Checking the visibility of the "Backtesting Manager" app with "Details" tab', async ({}) => {
    const { browser, context } = await launchBrowser();
    const newPage = await context.newPage();
    const stablePage = await context.newPage();

    await authorization(newPage);

    await openTwoPagesByParams(newPage, stablePage, {
        appUrl: EAppUrl.backtestingManager,
        serverUrl: EServerUrl.perf,
        tabUrl: ETabUrl.details,
        taskNumber: taskNumber,
    });

    const areEqual = await takeSnapshotsAndComparison(newPage, stablePage, nameApp, 'details');
    expect(areEqual).toBe(true);

    await browser.close();
});

test('Checking the visibility of the "Backtesting Manager" app with "Configs" tab', async ({}) => {
    const { browser, context } = await launchBrowser();
    const newPage = await context.newPage();
    const stablePage = await context.newPage();

    await authorization(newPage);

    await openTwoPagesByParams(newPage, stablePage, {
        appUrl: EAppUrl.backtestingManager,
        serverUrl: EServerUrl.perf,
        tabUrl: ETabUrl.configs,
        taskNumber: taskNumber,
    });

    const areEqual = await takeSnapshotsAndComparison(newPage, stablePage, nameApp, 'configs');
    expect(areEqual).toBe(true);

    await browser.close();
});

test('Checking the visibility of the "Backtesting Manager" app with "States" tab', async ({}) => {
    const { browser, context } = await launchBrowser();
    const newPage = await context.newPage();
    const stablePage = await context.newPage();

    await authorization(newPage);

    await openTwoPagesByParams(newPage, stablePage, {
        appUrl: EAppUrl.backtestingManager,
        serverUrl: EServerUrl.perf,
        tabUrl: ETabUrl.states,
        taskNumber: taskNumber,
    });

    const areEqual = await takeSnapshotsAndComparison(newPage, stablePage, nameApp, 'states');
    expect(areEqual).toBe(true);

    await browser.close();
});

test('Checking the visibility of the "Backtesting Manager" app with "Build Info" tab', async ({}) => {
    const { browser, context } = await launchBrowser();
    const newPage = await context.newPage();
    const stablePage = await context.newPage();

    await authorization(newPage);

    await openTwoPagesByParams(newPage, stablePage, {
        appUrl: EAppUrl.backtestingManager,
        serverUrl: EServerUrl.perf,
        tabUrl: ETabUrl.buildInfo,
        taskNumber: taskNumber,
    });

    const areEqual = await takeSnapshotsAndComparison(newPage, stablePage, nameApp, 'build-info');
    expect(areEqual).toBe(true);

    await browser.close();
});

test('Checking the visibility of the "Backtesting Manager" app with "Indicators" tab', async ({}) => {
    const { browser, context } = await launchBrowser();
    const newPage = await context.newPage();
    const stablePage = await context.newPage();

    await authorization(newPage);

    await openTwoPagesByParams(newPage, stablePage, {
        appUrl: EAppUrl.backtestingManager,
        serverUrl: EServerUrl.perf,
        tabUrl: ETabUrl.indicators,
        taskNumber: taskNumber,
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

test('Checking the visibility of the "Backtesting Manager" app with "Product Logs" tab', async ({}) => {
    const { browser, context } = await launchBrowser();
    const newPage = await context.newPage();
    const stablePage = await context.newPage();

    await authorization(newPage);

    await openTwoPagesByParams(newPage, stablePage, {
        appUrl: EAppUrl.backtestingManager,
        serverUrl: EServerUrl.perf,
        tabUrl: ETabUrl.productLogs,
        taskNumber: taskNumber,
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

test('Checking the visibility of the "Backtesting Manager" app with "Order Book" tab', async ({}) => {
    const { browser, context } = await launchBrowser();
    const newPage = await context.newPage();
    const stablePage = await context.newPage();

    await authorization(newPage);

    await openTwoPagesByParams(newPage, stablePage, {
        appUrl: EAppUrl.backtestingManager,
        serverUrl: EServerUrl.perf,
        tabUrl: ETabUrl.orderBook,
        taskNumber: taskNumber,
    });

    const areEqual = await takeSnapshotsAndComparison(newPage, stablePage, nameApp, 'order-book');
    expect(areEqual).toBe(true);

    await browser.close();
});

test.afterEach('Status check', async ({}, testInfo: TestInfo) => {
    if (test.info().retry === 1) {
        if (test.info().status === 'failed') await setLogs(testInfo);
    }
});
