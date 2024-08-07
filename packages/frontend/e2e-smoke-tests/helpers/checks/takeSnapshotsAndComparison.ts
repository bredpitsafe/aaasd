import { Page } from '@playwright/test';
import * as fs from 'fs';
import pixelmatch from 'pixelmatch';
import { PNG } from 'pngjs';

import { layoutPage, waitForLoadingToBeHidden } from '../../page-objects/common/layout.page';

let screenshotFolder = '';
if (process.env.CI) {
    const JOB_VERSION = String(process.env.CI_JOB_ID);
    screenshotFolder = `https://gitlab.advsys.work/platform/frontend/-/jobs/${JOB_VERSION}/artifacts/file/packages/frontend/e2e-smoke-tests/`;
} else {
    screenshotFolder = 'frontend/packages/frontend/e2e-smoke-tests/';
}

export async function takeSnapshotsAndComparison(
    newPage: Page,
    stablePage: Page,
    nameApp: string,
    nameTab: string,
    thresholdNumber: number = 10,
    nameLocator: string = layoutPage.layoutContainerSelector,
) {
    const newScreenshotPath = `screenshots/${nameApp}/${nameTab}/newScreenshot.png`;
    const stableScreenshotPath = `screenshots/${nameApp}/${nameTab}/stableScreenshot.png`;
    const diffScreenshotPath = `screenshots/${nameApp}/${nameTab}/diffScreenshot.png`;

    await new Promise((resolve) => setTimeout(resolve, 25000));

    await Promise.all([waitForLoadingToBeHidden(newPage), waitForLoadingToBeHidden(stablePage)]);

    const layoutNewTab = await newPage.$(nameLocator);
    const layoutStableTab = await stablePage.$(nameLocator);

    layoutNewTab && (await layoutNewTab.screenshot({ path: newScreenshotPath }));
    layoutStableTab && (await layoutStableTab.screenshot({ path: stableScreenshotPath }));

    const newScreenshotBuffer = fs.readFileSync(newScreenshotPath);
    const stableScreenshotBuffer = fs.readFileSync(stableScreenshotPath);

    const newScreenshotPNG = PNG.sync.read(newScreenshotBuffer);
    const stableScreenshotPNG = PNG.sync.read(stableScreenshotBuffer);
    const { width, height } = newScreenshotPNG;

    const diff = new PNG({ width, height });

    const numDiffPixels = pixelmatch(
        newScreenshotPNG.data,
        stableScreenshotPNG.data,
        diff.data,
        width,
        height,
        { threshold: 0 },
    );

    fs.writeFileSync(diffScreenshotPath, PNG.sync.write(diff));

    process.env.NEW_SCREENSHOT_PATH = screenshotFolder + newScreenshotPath;
    process.env.STABLE_SCREENSHOT_PATH = screenshotFolder + stableScreenshotPath;
    process.env.DIFF_SCREENSHOT_PATH = screenshotFolder + diffScreenshotPath;

    if (typeof thresholdNumber !== 'undefined') {
        return numDiffPixels < thresholdNumber;
    } else {
        return numDiffPixels < 10;
    }
}
