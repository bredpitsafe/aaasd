import { expect, test } from '@playwright/test';
import { TestInfo } from 'playwright/test';

import { takeSnapshotsAndComparison } from '../helpers/checks/takeSnapshotsAndComparison';
import { authorization } from '../helpers/modules/authorization';
import { openTwoPagesByParams } from '../helpers/modules/openTwoPagesByParams';
import { setLogs } from '../helpers/modules/setLogs';
import { EAppUrl } from '../interfaces/app-interfaces';
import { EPageUrl } from '../interfaces/page-interfaces';
import { EServerUrl } from '../interfaces/server-interfaces';
import { ETabUrl } from '../interfaces/tab-interfaces';

const { launchBrowser } = require('../helpers/modules/launchBrowser');
const nameApp = 'balance-monitor.spec';

test('Checking the visibility of the "Balance Monitor" app with "Suggested Transfers" tab', async ({}) => {
    const { browser, context } = await launchBrowser();
    const newPage = await context.newPage();
    const stablePage = await context.newPage();

    await authorization(newPage);

    await openTwoPagesByParams(newPage, stablePage, {
        appUrl: EAppUrl.balanceMonitor,
        serverUrl: EServerUrl.atfDev,
        pageUrl: EPageUrl.balanceMonitor,
        tabUrl: ETabUrl.suggestedTransfers,
    });

    const areEqual = await takeSnapshotsAndComparison(
        newPage,
        stablePage,
        nameApp,
        'balance-monitor-suggested-transfers',
    );
    expect(areEqual).toBe(true);

    await browser.close();
});

test('Checking the visibility of the "Balance Monitor" app with "Transfers History" tab', async ({}) => {
    const { browser, context } = await launchBrowser();
    const newPage = await context.newPage();
    const stablePage = await context.newPage();

    await authorization(newPage);

    await openTwoPagesByParams(newPage, stablePage, {
        appUrl: EAppUrl.balanceMonitor,
        serverUrl: EServerUrl.atfDev,
        pageUrl: EPageUrl.balanceMonitor,
        tabUrl: ETabUrl.transfersHistory,
    });

    const areEqual = await takeSnapshotsAndComparison(
        newPage,
        stablePage,
        nameApp,
        'balance-monitor-transfers-history',
    );
    expect(areEqual).toBe(true);

    await browser.close();
});

test('Checking the visibility of the "Balance Monitor" app with "Coin Transfer Details" tab', async ({}) => {
    const { browser, context } = await launchBrowser();
    const newPage = await context.newPage();
    const stablePage = await context.newPage();

    await authorization(newPage);

    await openTwoPagesByParams(newPage, stablePage, {
        appUrl: EAppUrl.balanceMonitor,
        serverUrl: EServerUrl.atfDev,
        pageUrl: EPageUrl.balanceMonitor,
        tabUrl: ETabUrl.coinTransferDetails,
    });

    const areEqual = await takeSnapshotsAndComparison(
        newPage,
        stablePage,
        nameApp,
        'balance-monitor-coin-transfer-details',
    );
    expect(areEqual).toBe(true);

    await browser.close();
});

test('Checking the visibility of the "Balance Monitor" app with "Distribution" tab', async ({}) => {
    const { browser, context } = await launchBrowser();
    const newPage = await context.newPage();
    const stablePage = await context.newPage();

    await authorization(newPage);

    await openTwoPagesByParams(newPage, stablePage, {
        appUrl: EAppUrl.balanceMonitor,
        serverUrl: EServerUrl.atfDev,
        pageUrl: EPageUrl.balanceMonitor,
        tabUrl: ETabUrl.distribution,
    });

    const areEqual = await takeSnapshotsAndComparison(
        newPage,
        stablePage,
        nameApp,
        'balance-monitor-distribution',
    );
    expect(areEqual).toBe(true);

    await browser.close();
});

test('Checking the visibility of the "Balance Monitor" app with "Gathering" tab', async ({}) => {
    const { browser, context } = await launchBrowser();
    const newPage = await context.newPage();
    const stablePage = await context.newPage();

    await authorization(newPage);

    await openTwoPagesByParams(newPage, stablePage, {
        appUrl: EAppUrl.balanceMonitor,
        serverUrl: EServerUrl.atfDev,
        pageUrl: EPageUrl.balanceMonitor,
        tabUrl: ETabUrl.gathering,
    });

    const areEqual = await takeSnapshotsAndComparison(
        newPage,
        stablePage,
        nameApp,
        'balance-monitor-gathering',
    );
    expect(areEqual).toBe(true);

    await browser.close();
});

test('Checking the visibility of the "Balance Monitor" app with "Send data to analyse" tab', async ({}) => {
    const { browser, context } = await launchBrowser();
    const newPage = await context.newPage();
    const stablePage = await context.newPage();

    await authorization(newPage);

    await openTwoPagesByParams(newPage, stablePage, {
        appUrl: EAppUrl.balanceMonitor,
        serverUrl: EServerUrl.atfDev,
        pageUrl: EPageUrl.balanceMonitor,
        tabUrl: ETabUrl.sendDataToAnalyse,
    });

    const areEqual = await takeSnapshotsAndComparison(
        newPage,
        stablePage,
        nameApp,
        'balance-monitor-send-data-to-analyse',
    );
    expect(areEqual).toBe(true);

    await browser.close();
});

test('Checking the visibility of the "Balance Monitor" app with "Manual Transfer" tab', async ({}) => {
    const { browser, context } = await launchBrowser();
    const newPage = await context.newPage();
    const stablePage = await context.newPage();

    await authorization(newPage);

    await openTwoPagesByParams(newPage, stablePage, {
        appUrl: EAppUrl.balanceMonitor,
        serverUrl: EServerUrl.atfDev,
        pageUrl: EPageUrl.balanceMonitor,
        tabUrl: ETabUrl.manualTransfer,
    });

    const areEqual = await takeSnapshotsAndComparison(
        newPage,
        stablePage,
        nameApp,
        'balance-monitor-manual-transfer',
    );
    expect(areEqual).toBe(true);

    await browser.close();
});

test('Checking the visibility of the "Balance Monitor" app with "Component Statuses" tab', async ({}) => {
    const { browser, context } = await launchBrowser();
    const newPage = await context.newPage();
    const stablePage = await context.newPage();

    await authorization(newPage);

    await openTwoPagesByParams(newPage, stablePage, {
        appUrl: EAppUrl.balanceMonitor,
        serverUrl: EServerUrl.atfDev,
        pageUrl: EPageUrl.balanceMonitor,
        tabUrl: ETabUrl.componentStatuses,
    });

    const areEqual = await takeSnapshotsAndComparison(
        newPage,
        stablePage,
        nameApp,
        'balance-monitor-component-statuses',
    );
    expect(areEqual).toBe(true);

    await browser.close();
});

test.skip('Checking the visibility of the "Balance Monitor" app with "Pump and Dump" tab', async ({}) => {
    const { browser, context } = await launchBrowser();
    const newPage = await context.newPage();
    const stablePage = await context.newPage();

    await authorization(newPage);

    await openTwoPagesByParams(newPage, stablePage, {
        appUrl: EAppUrl.balanceMonitor,
        serverUrl: EServerUrl.atfDev,
        pageUrl: EPageUrl.balanceMonitor,
        tabUrl: ETabUrl.pumpAndDump,
    });

    const areEqual = await takeSnapshotsAndComparison(
        newPage,
        stablePage,
        nameApp,
        'balance-monitor-pump-and-dump',
    );
    expect(areEqual).toBe(true);

    await browser.close();
});

test('Checking the visibility of the "Balance Monitor" app with "Internal Transfers" tab', async ({}) => {
    const { browser, context } = await launchBrowser();
    const newPage = await context.newPage();
    const stablePage = await context.newPage();

    await authorization(newPage);

    await openTwoPagesByParams(newPage, stablePage, {
        appUrl: EAppUrl.balanceMonitor,
        serverUrl: EServerUrl.atfDev,
        pageUrl: EPageUrl.internalTransfers,
        tabUrl: ETabUrl.internalTransfers,
    });

    const areEqual = await takeSnapshotsAndComparison(
        newPage,
        stablePage,
        nameApp,
        'internal-transfers-internal-transfers',
    );
    expect(areEqual).toBe(true);

    await browser.close();
});

test('Checking the visibility of the "Balance Monitor" app with "Internal Transfers History" tab', async ({}) => {
    const { browser, context } = await launchBrowser();
    const newPage = await context.newPage();
    const stablePage = await context.newPage();

    await authorization(newPage);

    await openTwoPagesByParams(newPage, stablePage, {
        appUrl: EAppUrl.balanceMonitor,
        serverUrl: EServerUrl.atfDev,
        pageUrl: EPageUrl.internalTransfers,
        tabUrl: ETabUrl.internalTransfersHistory,
    });

    const areEqual = await takeSnapshotsAndComparison(
        newPage,
        stablePage,
        nameApp,
        'internal-transfers-internal-transfers-history',
    );
    expect(areEqual).toBe(true);

    await browser.close();
});

test('Checking the visibility of the "Balance Monitor" app with "Add Transfer Blocking Rule" tab', async ({}) => {
    const { browser, context } = await launchBrowser();
    const newPage = await context.newPage();
    const stablePage = await context.newPage();

    await authorization(newPage);

    await openTwoPagesByParams(newPage, stablePage, {
        appUrl: EAppUrl.balanceMonitor,
        serverUrl: EServerUrl.atfDev,
        pageUrl: EPageUrl.transferBlockingRules,
        tabUrl: ETabUrl.addTransferBlockingRule,
    });

    const areEqual = await takeSnapshotsAndComparison(
        newPage,
        stablePage,
        nameApp,
        'transfer-blocking-rules-add-transfer-blocking-rule',
    );
    expect(areEqual).toBe(true);

    await browser.close();
});

test('Checking the visibility of the "Balance Monitor" app with "Transfer Blocking Rules" tab', async ({}) => {
    const { browser, context } = await launchBrowser();
    const newPage = await context.newPage();
    const stablePage = await context.newPage();

    await authorization(newPage);

    await openTwoPagesByParams(newPage, stablePage, {
        appUrl: EAppUrl.balanceMonitor,
        serverUrl: EServerUrl.atfDev,
        pageUrl: EPageUrl.transferBlockingRules,
        tabUrl: ETabUrl.transferBlockingRules,
    });

    const areEqual = await takeSnapshotsAndComparison(
        newPage,
        stablePage,
        nameApp,
        'transfer-blocking-rules-transfer-blocking-rules',
    );
    expect(areEqual).toBe(true);

    await browser.close();
});

test('Checking the visibility of the "Balance Monitor" app with "Add Amount limits Rule" tab', async ({}) => {
    const { browser, context } = await launchBrowser();
    const newPage = await context.newPage();
    const stablePage = await context.newPage();

    await authorization(newPage);

    await openTwoPagesByParams(newPage, stablePage, {
        appUrl: EAppUrl.balanceMonitor,
        serverUrl: EServerUrl.atfDev,
        pageUrl: EPageUrl.amountLimitsRules,
        tabUrl: ETabUrl.addAmountLimitsRule,
    });

    const areEqual = await takeSnapshotsAndComparison(
        newPage,
        stablePage,
        nameApp,
        'amount-limits-rules-add-amount-limits-rule',
    );
    expect(areEqual).toBe(true);

    await browser.close();
});

test('Checking the visibility of the "Balance Monitor" app with "Amount Limits Rules" tab', async ({}) => {
    const { browser, context } = await launchBrowser();
    const newPage = await context.newPage();
    const stablePage = await context.newPage();

    await authorization(newPage);

    await openTwoPagesByParams(newPage, stablePage, {
        appUrl: EAppUrl.balanceMonitor,
        serverUrl: EServerUrl.atfDev,
        pageUrl: EPageUrl.autoTransferRules,
        tabUrl: ETabUrl.amountLimitsRules,
    });

    const areEqual = await takeSnapshotsAndComparison(
        newPage,
        stablePage,
        nameApp,
        'amount-limits-rules-amount-limits-rules',
    );
    expect(areEqual).toBe(true);

    await browser.close();
});

test('Checking the visibility of the "Balance Monitor" app with "Add Auto Transfer Rule" tab', async ({}) => {
    const { browser, context } = await launchBrowser();
    const newPage = await context.newPage();
    const stablePage = await context.newPage();

    await authorization(newPage);

    await openTwoPagesByParams(newPage, stablePage, {
        appUrl: EAppUrl.balanceMonitor,
        serverUrl: EServerUrl.atfDev,
        pageUrl: EPageUrl.autoTransferRules,
        tabUrl: ETabUrl.addAutoTransferRule,
    });

    const areEqual = await takeSnapshotsAndComparison(
        newPage,
        stablePage,
        nameApp,
        'auto-transfer-rules-add-auto-transfer-rule',
    );
    expect(areEqual).toBe(true);

    await browser.close();
});

test('Checking the visibility of the "Balance Monitor" app with "Auto Transfer Rules" tab', async ({}) => {
    const { browser, context } = await launchBrowser();
    const newPage = await context.newPage();
    const stablePage = await context.newPage();

    await authorization(newPage);

    await openTwoPagesByParams(newPage, stablePage, {
        appUrl: EAppUrl.balanceMonitor,
        serverUrl: EServerUrl.atfDev,
        pageUrl: EPageUrl.autoTransferRules,
        tabUrl: ETabUrl.autoTransferRules,
    });

    const areEqual = await takeSnapshotsAndComparison(
        newPage,
        stablePage,
        nameApp,
        'auto-transfer-rules-auto-transfer-rules',
    );
    expect(areEqual).toBe(true);

    await browser.close();
});

test.afterEach('Status check', async ({}, testInfo: TestInfo) => {
    if (test.info().retry === 1) {
        if (test.info().status === 'failed') await setLogs(testInfo);
    }
});
