import { expect, test } from '@playwright/test';
import { TestInfo } from 'playwright/test';

import { takeSnapshotsAndComparison } from '../helpers/checks/takeSnapshotsAndComparison';
import { authorization } from '../helpers/modules/authorization';
import { openTwoPagesByParams } from '../helpers/modules/openTwoPagesByParams';
import { setLogs } from '../helpers/modules/setLogs';
import { EAppUrl } from '../interfaces/app-interfaces';
import { EDashboardID } from '../interfaces/dashboardID-interfaces';
import { EPageUrl } from '../interfaces/page-interfaces';
import { layoutPage } from '../page-objects/common/layout.page';

const { launchBrowser } = require('../helpers/modules/launchBrowser');
const nameApp = 'dashboard.spec';
const thresholdNumber = 10;

test('Checking the visibility of the "Dashboard" app with "chart" panel', async ({}) => {
    const { browser, context } = await launchBrowser();
    const newPage = await context.newPage();
    const stablePage = await context.newPage();

    await authorization(newPage);

    await openTwoPagesByParams(newPage, stablePage, {
        appUrl: EAppUrl.dashboard,
        pageUrl: EPageUrl.dashboard,
        dashboardId: EDashboardID.chart,
    });

    const areEqual = await takeSnapshotsAndComparison(
        newPage,
        stablePage,
        nameApp,
        'chart',
        thresholdNumber,
        layoutPage.gridLayout,
    );
    expect(areEqual).toBe(true);

    await browser.close();
});

test('Checking the visibility of the "Dashboard" app with "grid" panel', async ({}) => {
    const { browser, context } = await launchBrowser();
    const newPage = await context.newPage();
    const stablePage = await context.newPage();

    await authorization(newPage);

    await openTwoPagesByParams(newPage, stablePage, {
        appUrl: EAppUrl.dashboard,
        pageUrl: EPageUrl.dashboard,
        dashboardId: EDashboardID.grid,
    });

    const areEqual = await takeSnapshotsAndComparison(
        newPage,
        stablePage,
        nameApp,
        'grid',
        thresholdNumber,
        layoutPage.gridLayout,
    );
    expect(areEqual).toBe(true);

    await browser.close();
});

test('Checking the visibility of the "Dashboard" app with "grid-features" panel', async ({}) => {
    const { browser, context } = await launchBrowser();
    const newPage = await context.newPage();
    const stablePage = await context.newPage();

    await authorization(newPage);

    await openTwoPagesByParams(newPage, stablePage, {
        appUrl: EAppUrl.dashboard,
        pageUrl: EPageUrl.dashboard,
        dashboardId: EDashboardID.gridFeatures,
    });

    const areEqual = await takeSnapshotsAndComparison(
        newPage,
        stablePage,
        nameApp,
        'grid-features',
        thresholdNumber,
        layoutPage.gridLayout,
    );
    expect(areEqual).toBe(true);

    await browser.close();
});

test('Checking the visibility of the "Dashboard" app with "panels" panel', async ({}) => {
    const { browser, context } = await launchBrowser();
    const newPage = await context.newPage();
    const stablePage = await context.newPage();

    await authorization(newPage);

    await openTwoPagesByParams(newPage, stablePage, {
        appUrl: EAppUrl.dashboard,
        pageUrl: EPageUrl.dashboard,
        dashboardId: EDashboardID.panels,
    });

    const areEqual = await takeSnapshotsAndComparison(
        newPage,
        stablePage,
        nameApp,
        'panels-without-type',
        thresholdNumber,
        layoutPage.gridLayout,
    );
    expect(areEqual).toBe(true);

    await browser.close();
});

test('Checking the visibility of the "Dashboard" app with "panels-layouts" panel', async ({}) => {
    const { browser, context } = await launchBrowser();
    const newPage = await context.newPage();
    const stablePage = await context.newPage();

    await authorization(newPage);

    await openTwoPagesByParams(newPage, stablePage, {
        appUrl: EAppUrl.dashboard,
        pageUrl: EPageUrl.dashboard,
        dashboardId: EDashboardID.panelsLayouts,
    });

    const areEqual = await takeSnapshotsAndComparison(
        newPage,
        stablePage,
        nameApp,
        'panels-layouts',
        thresholdNumber,
        layoutPage.gridLayout,
    );
    expect(areEqual).toBe(true);

    await browser.close();
});

test('Checking the visibility of the "Dashboard" app with "panels-with-type" panel', async ({}) => {
    const { browser, context } = await launchBrowser();
    const newPage = await context.newPage();
    const stablePage = await context.newPage();

    await authorization(newPage);

    await openTwoPagesByParams(newPage, stablePage, {
        appUrl: EAppUrl.dashboard,
        pageUrl: EPageUrl.dashboard,
        dashboardId: EDashboardID.panelsWithType,
    });

    const areEqual = await takeSnapshotsAndComparison(
        newPage,
        stablePage,
        nameApp,
        'panels-with-type',
        thresholdNumber,
        layoutPage.gridLayout,
    );
    expect(areEqual).toBe(true);

    await browser.close();
});

test('Checking the visibility of the "Dashboard" app with "panels-without-type" panel', async ({}) => {
    const { browser, context } = await launchBrowser();
    const newPage = await context.newPage();
    const stablePage = await context.newPage();

    await authorization(newPage);

    await openTwoPagesByParams(newPage, stablePage, {
        appUrl: EAppUrl.dashboard,
        pageUrl: EPageUrl.dashboard,
        dashboardId: EDashboardID.panelsWithoutType,
    });

    const areEqual = await takeSnapshotsAndComparison(
        newPage,
        stablePage,
        nameApp,
        'panels-without-type',
        thresholdNumber,
        layoutPage.gridLayout,
    );
    expect(areEqual).toBe(true);

    await browser.close();
});

test('Checking the visibility of the "Dashboard" app with "table-features" panel', async ({}) => {
    const { browser, context } = await launchBrowser();
    const newPage = await context.newPage();
    const stablePage = await context.newPage();

    await authorization(newPage);

    await openTwoPagesByParams(newPage, stablePage, {
        appUrl: EAppUrl.dashboard,
        pageUrl: EPageUrl.dashboard,
        dashboardId: EDashboardID.tableFeatures,
    });

    const areEqual = await takeSnapshotsAndComparison(
        newPage,
        stablePage,
        nameApp,
        'table-features',
        thresholdNumber,
        layoutPage.gridLayout,
    );
    expect(areEqual).toBe(true);

    await browser.close();
});

test.afterEach('Status check', async ({}, testInfo: TestInfo) => {
    if (test.info().retry === 1) {
        if (test.info().status === 'failed') await setLogs(testInfo);
    }
});
