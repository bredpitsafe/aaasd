import { addCucumberPreprocessorPlugin } from '@badeball/cypress-cucumber-preprocessor';
import * as webpack from '@cypress/webpack-preprocessor';
import { initPlugin } from '@frsource/cypress-plugin-visual-regression-diff/plugins';
import { defineConfig } from 'cypress';
import * as dotenv from 'dotenv';

dotenv.config();

async function setupNodeEvents(
    on: Cypress.PluginEvents,
    config: Cypress.PluginConfigOptions,
): Promise<Cypress.PluginConfigOptions> {
    // This is required for the preprocessor to be able to generate JSON reports after each run, and more.
    await addCucumberPreprocessorPlugin(on, config);
    initPlugin(on, config);
    on(
        'file:preprocessor',
        webpack({
            webpackOptions: {
                resolve: {
                    extensions: ['.ts', '.js'],
                },
                module: {
                    rules: [
                        {
                            test: /\.ts$/,
                            exclude: [/node_modules/],
                            use: [
                                {
                                    loader: 'swc-loader',
                                },
                            ],
                        },
                        {
                            test: /\.feature$/,
                            use: [
                                {
                                    loader: '@badeball/cypress-cucumber-preprocessor/webpack',
                                    options: config,
                                },
                            ],
                        },
                    ],
                },
            },
        }),
    );

    on('task', {
        log(message) {
            // eslint-disable-next-line no-console
            console.log(message);
            return null;
        },
    });

    // Make sure to return the config object as it might have been modified by the plugin.
    config.env = {
        ...process.env,
        ...config.env,
    };
    return config;
}

// eslint-disable-next-line import/no-default-export
export default defineConfig({
    reporter: 'junit',
    reporterOptions: {
        testCaseSwitchClassnameAndName: true,
        mochaFile: 'cypress/results/results[hash].xml',
    },
    e2e: {
        supportFile: 'cypress/support/e2e.ts',
        defaultCommandTimeout: 30000,
        baseUrl: 'https://localhost:8080/',
        viewportWidth: 1800,
        viewportHeight: 1200,
        screenshotOnRunFailure: true,
        video: false,
        retries: {
            runMode: 1,
        },
        env: {
            backendServerName: 'autocmn',
            baseUrlCharter: 'http://localhost:8087/',
            baseUrlHerodotusDashboard: 'https://localhost:8083/',
            baseUrlHerodotusTerminal: 'https://localhost:8084/',
            baseUrlHerodotusTrades: 'https://localhost:8085/',
            webSocketUrl: 'wss://ms.advsys.work/autocmn/',
            trashAssetsBeforeRuns: true,
            video: false,
            failSilently: false,
        },
        setupNodeEvents,
        specPattern: 'cypress/e2e/**/*.feature',
    },
});
