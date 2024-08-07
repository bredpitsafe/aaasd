// ***********************************************************
// This example support/e2e.ts is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:

import './commands';
// const retryCounter = {};
// Alternatively you can use CommonJS syntax:
// require('./commands')

beforeEach(() => {
    cy.intercept({ url: 'https://localhost:8080/1x1.png' }, (req) => req.reply(200));
});

// afterEach(() => {
//     // @ts-ignore
//     const currentTest = cy.state('test');
//     if (currentTest.state === 'failed') {
//         if (retryCounter[currentTest.title] === undefined) {
//             retryCounter[currentTest.title] = 1;
//         } else {
//             retryCounter[currentTest.title] += 1;
//         }
//         if (retryCounter[currentTest.title] === 2) {
//         }
//     } else {
//         retryCounter[currentTest.title] = 0;
//     }
// });

// function getSocketsSubscriptionsScreenshot(): void {
//     if (Cypress.$(testSelector(EMainMenuModalSelectors.OpenSocketsButton)).length === 1) {
//         customWait(1);
//         cy.get(testSelector(EMainMenuModalSelectors.OpenSocketsButton)).click({ force: true });
//         customWait(1);
//         cy.get(EMainMenuModalSelectors.OpenSubscriptionsTableButton).click({ force: true });
//         customWait(1);
//         cy.screenshot('Subscriptions');
//     }
//     return;
// }
//
// function getDownloadLogs(): void {
//     if (Cypress.$(EModalSelectors.SettingButton).length === 1) {
//         customWait(1);
//         cy.get(EModalSelectors.SettingButton).click({ force: true });
//         customWait(1);
//         cy.get(testSelector(EModalSelectors.DownloadLogsButton)).click({ force: true });
//         customWait(5);
//     }
//     return;
// }
