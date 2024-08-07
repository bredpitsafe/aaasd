import { defineConfig, devices } from '@playwright/test';

// eslint-disable-next-line import/no-default-export
export default defineConfig({
    testDir: './tests',
    timeout: 60 * 1000,
    retries: 1,
    workers: 4,
    reporter: [['list'], ['junit', { outputFile: 'results/test_results.xml' }]],
    projects: [
        {
            name: 'chromium',
            use: { ...devices['Desktop Chrome'], viewport: { width: 1900, height: 1200 } },
        },
        {
            name: 'firefox',
            use: { ...devices['Desktop Firefox'], viewport: { width: 1900, height: 1200 } },
        },
    ],
});
