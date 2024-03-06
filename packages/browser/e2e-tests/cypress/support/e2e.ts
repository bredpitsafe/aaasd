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

// Alternatively you can use CommonJS syntax:
// require('./commands')

// let consecutiveFailures = 0;

beforeEach(() => {
    cy.intercept({ url: 'https://localhost:8080/1x1.png' }, (req) => req.reply(200));
});

// afterEach(() => {
//     // @ts-ignore
//     if (cy.state('test').state === 'failed') {
//         consecutiveFailures++;
//         if (consecutiveFailures > 1) {
//             cy.screenshot();
//             consecutiveFailures = 0;
//         }
//         // downloadLogs();
//     } else {
//         consecutiveFailures = 0;
//     }
// });

// function downloadLogs(): void {
//     if (Cypress.$(EModalSelectors.SettingButton).length === 1) {
//         cy.get(EModalSelectors.SettingButton).click({ force: true });
//         cy.wait(1000);
//         cy.get(testSelector(EModalSelectors.DownloadLogsButton)).click({ force: true });
//         cy.wait(5000);
//     }
//     return;
// }
