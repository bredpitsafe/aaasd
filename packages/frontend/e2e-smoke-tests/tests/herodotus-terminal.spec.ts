import { expect, test } from '@playwright/test';
import { TestInfo } from 'playwright/test';

import { takeSnapshotsAndComparison } from '../helpers/checks/takeSnapshotsAndComparison';
import { authorization } from '../helpers/modules/authorization';
import { openTwoPagesByParams } from '../helpers/modules/openTwoPagesByParams';
import { setLogs } from '../helpers/modules/setLogs';
import { EAppUrl } from '../interfaces/app-interfaces';
import { ERobotId } from '../interfaces/robotId-interfaces';
import { EServerUrl } from '../interfaces/server-interfaces';
import { ETabUrl } from '../interfaces/tab-interfaces';

const { launchBrowser } = require('../helpers/modules/launchBrowser');
const nameApp = 'herodotus-terminal.spec';

test('Checking the visibility of the "Herodotus Terminal" app with "Add Task" tab', async ({}) => {
    const { browser, context } = await launchBrowser();
    const newPage = await context.newPage();
    const stablePage = await context.newPage();

    await authorization(newPage);

    await openTwoPagesByParams(newPage, stablePage, {
        appUrl: EAppUrl.herodotusTerminal,
        serverUrl: EServerUrl.hypercube,
        robotId: ERobotId.hypercubeHerodotusMulti,
        tabUrl: ETabUrl.addTask,
    });

    const areEqual = await takeSnapshotsAndComparison(newPage, stablePage, nameApp, 'add-task');
    expect(areEqual).toBe(true);

    await browser.close();
});

test('Checking the visibility of the "Herodotus Terminal" app with "Active Tasks" tab', async ({}) => {
    const { browser, context } = await launchBrowser();
    const newPage = await context.newPage();
    const stablePage = await context.newPage();

    await authorization(newPage);

    await openTwoPagesByParams(newPage, stablePage, {
        appUrl: EAppUrl.herodotusTerminal,
        serverUrl: EServerUrl.hypercube,
        robotId: ERobotId.hypercubeHerodotusMulti,
        tabUrl: ETabUrl.activeTasks,
    });

    const areEqual = await takeSnapshotsAndComparison(newPage, stablePage, nameApp, 'active-tasks');
    expect(areEqual).toBe(true);

    await browser.close();
});

test('Checking the visibility of the "Herodotus Terminal" app with "Archived Tasks" tab', async ({}) => {
    const { browser, context } = await launchBrowser();
    const newPage = await context.newPage();
    const stablePage = await context.newPage();

    await authorization(newPage);

    await openTwoPagesByParams(newPage, stablePage, {
        appUrl: EAppUrl.herodotusTerminal,
        serverUrl: EServerUrl.hypercube,
        robotId: ERobotId.hypercubeHerodotusMulti,
        tabUrl: ETabUrl.archivedTasks,
    });

    const areEqual = await takeSnapshotsAndComparison(
        newPage,
        stablePage,
        nameApp,
        'archived-tasks',
    );
    expect(areEqual).toBe(true);

    await browser.close();
});

test('Checking the visibility of the "Herodotus Terminal" app with "Status Messages" tab', async ({}) => {
    const { browser, context } = await launchBrowser();
    const newPage = await context.newPage();
    const stablePage = await context.newPage();

    await authorization(newPage);

    await openTwoPagesByParams(newPage, stablePage, {
        appUrl: EAppUrl.herodotusTerminal,
        serverUrl: EServerUrl.hypercube,
        robotId: ERobotId.hypercubeHerodotusMulti,
        tabUrl: ETabUrl.statusMessages,
    });

    const areEqual = await takeSnapshotsAndComparison(
        newPage,
        stablePage,
        nameApp,
        'status-messages',
        50,
    );
    expect(areEqual).toBe(true);

    await browser.close();
});

test.afterEach('Status check', async ({}, testInfo: TestInfo) => {
    if (test.info().retry === 1) {
        if (test.info().status === 'failed') await setLogs(testInfo);
    }
});
