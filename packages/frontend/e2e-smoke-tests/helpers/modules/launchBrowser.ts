const { chromium } = require('playwright');

async function launchBrowser() {
    const browser = await chromium.launch();
    const context = await browser.newContext({ ignoreHTTPSErrors: true });
    return { browser, context };
}

module.exports = { launchBrowser };
