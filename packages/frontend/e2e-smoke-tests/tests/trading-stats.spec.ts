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
const nameApp = 'trading-stats.spec';

test('Checking the visibility of the "Trading Stats" app with "PNL" tab', async ({}) => {
    const { browser, context } = await launchBrowser();
    const newPage = await context.newPage();
    const stablePage = await context.newPage();

    await authorization(newPage);

    await openTwoPagesByParams(newPage, stablePage, {
        appUrl: EAppUrl.tradingStats,
        serverUrl: EServerUrl.hypercube,
        pageUrl: EPageUrl.daily,
        tabUrl: ETabUrl.pnl,
    });

    const areEqual = await takeSnapshotsAndComparison(newPage, stablePage, nameApp, 'daily-pnl');
    expect(areEqual).toBe(true);

    await browser.close();
});

test('Checking the visibility of the "Trading Stats" app with "ARB" tab', async ({}) => {
    const { browser, context } = await launchBrowser();
    const newPage = await context.newPage();
    const stablePage = await context.newPage();

    await authorization(newPage);

    await openTwoPagesByParams(newPage, stablePage, {
        appUrl: EAppUrl.tradingStats,
        serverUrl: EServerUrl.hypercube,
        pageUrl: EPageUrl.daily,
        tabUrl: ETabUrl.arb,
    });

    const areEqual = await takeSnapshotsAndComparison(newPage, stablePage, nameApp, 'daily-arb');
    expect(areEqual).toBe(true);

    await browser.close();
});

test('Checking the visibility of the "Trading Stats" app with "Trades" tab', async ({}) => {
    const { browser, context } = await launchBrowser();
    const newPage = await context.newPage();
    const stablePage = await context.newPage();

    await authorization(newPage);

    await openTwoPagesByParams(newPage, stablePage, {
        appUrl: EAppUrl.tradingStats,
        serverUrl: EServerUrl.hypercube,
        pageUrl: EPageUrl.daily,
        tabUrl: ETabUrl.trades,
    });

    const areEqual = await takeSnapshotsAndComparison(
        newPage,
        stablePage,
        nameApp,
        'daily-trades',
        50,
    );
    expect(areEqual).toBe(true);

    await browser.close();
});

test('Checking the visibility of the "Trading Stats" app with "Monthly Stats" tab', async ({}) => {
    const { browser, context } = await launchBrowser();
    const newPage = await context.newPage();
    const stablePage = await context.newPage();

    await authorization(newPage);

    await openTwoPagesByParams(newPage, stablePage, {
        appUrl: EAppUrl.tradingStats,
        serverUrl: EServerUrl.hypercube,
        pageUrl: EPageUrl.monthly,
        tabUrl: ETabUrl.monthlyStats,
    });

    const areEqual = await takeSnapshotsAndComparison(
        newPage,
        stablePage,
        nameApp,
        'monthly-stats',
    );
    expect(areEqual).toBe(true);

    await browser.close();
});

test('Checking the visibility of the "Trading Stats" app with "Profits" tab', async ({}) => {
    const { browser, context } = await launchBrowser();
    const newPage = await context.newPage();
    const stablePage = await context.newPage();

    await authorization(newPage);

    await openTwoPagesByParams(newPage, stablePage, {
        appUrl: EAppUrl.tradingStats,
        serverUrl: EServerUrl.hypercube,
        pageUrl: EPageUrl.monthly,
        tabUrl: ETabUrl.profits,
    });

    const areEqual = await takeSnapshotsAndComparison(
        newPage,
        stablePage,
        nameApp,
        'monthly-profits',
    );
    expect(areEqual).toBe(true);

    await browser.close();
});

test('Checking the visibility of the "Trading Stats" app with "ARB Volume" tab', async ({}) => {
    const { browser, context } = await launchBrowser();
    const newPage = await context.newPage();
    const stablePage = await context.newPage();

    await authorization(newPage);

    await openTwoPagesByParams(newPage, stablePage, {
        appUrl: EAppUrl.tradingStats,
        serverUrl: EServerUrl.hypercube,
        pageUrl: EPageUrl.monthly,
        tabUrl: ETabUrl.arbVolume,
    });

    const areEqual = await takeSnapshotsAndComparison(
        newPage,
        stablePage,
        nameApp,
        'monthly-arb-volume',
    );
    expect(areEqual).toBe(true);

    await browser.close();
});

test('Checking the visibility of the "Trading Stats" app with "ARB Maker" tab', async ({}) => {
    const { browser, context } = await launchBrowser();
    const newPage = await context.newPage();
    const stablePage = await context.newPage();

    await authorization(newPage);

    await openTwoPagesByParams(newPage, stablePage, {
        appUrl: EAppUrl.tradingStats,
        serverUrl: EServerUrl.hypercube,
        pageUrl: EPageUrl.monthly,
        tabUrl: ETabUrl.arbMaker,
    });

    const areEqual = await takeSnapshotsAndComparison(
        newPage,
        stablePage,
        nameApp,
        'monthly-arb-maker',
    );
    expect(areEqual).toBe(true);

    await browser.close();
});

test('Checking the visibility of the "Trading Stats" app with "ARB Taker" tab', async ({}) => {
    const { browser, context } = await launchBrowser();
    const newPage = await context.newPage();
    const stablePage = await context.newPage();

    await authorization(newPage);

    await openTwoPagesByParams(newPage, stablePage, {
        appUrl: EAppUrl.tradingStats,
        serverUrl: EServerUrl.hypercube,
        pageUrl: EPageUrl.monthly,
        tabUrl: ETabUrl.arbTaker,
    });

    const areEqual = await takeSnapshotsAndComparison(
        newPage,
        stablePage,
        nameApp,
        'monthly-arb-taker',
    );
    expect(areEqual).toBe(true);

    await browser.close();
});

test('Checking the visibility of the "Trading Stats" app with "ARB Fees" tab', async ({}) => {
    const { browser, context } = await launchBrowser();
    const newPage = await context.newPage();
    const stablePage = await context.newPage();

    await authorization(newPage);

    await openTwoPagesByParams(newPage, stablePage, {
        appUrl: EAppUrl.tradingStats,
        serverUrl: EServerUrl.hypercube,
        pageUrl: EPageUrl.monthly,
        tabUrl: ETabUrl.arbFees,
    });

    const areEqual = await takeSnapshotsAndComparison(
        newPage,
        stablePage,
        nameApp,
        'monthly-arb-fees',
    );
    expect(areEqual).toBe(true);

    await browser.close();
});

test.afterEach('Status check', async ({}, testInfo: TestInfo) => {
    if (test.info().retry === 1) {
        if (test.info().status === 'failed') await setLogs(testInfo);
    }
});
