import { TestInfo } from 'playwright/test';

export async function setLogs(testInfo: TestInfo) {
    const NEW_SCREENSHOT_PATH = process.env.NEW_SCREENSHOT_PATH;
    const STABLE_SCREENSHOT_PATH = process.env.STABLE_SCREENSHOT_PATH;
    const DIFF_SCREENSHOT_PATH = process.env.DIFF_SCREENSHOT_PATH;
    // eslint-disable-next-line no-console
    console.log(`NEW_TAB_PATH: ${process.env.NEW_TAB_PATH}`);
    // eslint-disable-next-line no-console
    console.log(`STABLE_TAB_PATH: ${process.env.STABLE_TAB_PATH}`);

    if (NEW_SCREENSHOT_PATH) {
        testInfo.attachments.push({
            name: 'NEW_SCREENSHOT_PATH',
            body: Buffer.from(NEW_SCREENSHOT_PATH),
            contentType: 'text/plain',
        });
    }

    if (STABLE_SCREENSHOT_PATH) {
        testInfo.attachments.push({
            name: 'STABLE_SCREENSHOT_PATH',
            body: Buffer.from(STABLE_SCREENSHOT_PATH),
            contentType: 'text/plain',
        });
    }

    if (DIFF_SCREENSHOT_PATH) {
        testInfo.attachments.push({
            name: 'DIFF_SCREENSHOT_PATH',
            body: Buffer.from(DIFF_SCREENSHOT_PATH),
            contentType: 'text/plain',
        });
    }
}
