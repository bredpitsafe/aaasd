/// <reference types="cypress" />
// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })
//
// declare global {
//   namespace Cypress {
//     interface Chainable {
//       login(email: string, password: string): Chainable<void>
//       drag(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
//       dismiss(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
//       visit(originalFn: CommandOriginalFn, url: string, options: Partial<VisitOptions>): Chainable<Element>
//     }
//   }
// }

import '@frsource/cypress-plugin-visual-regression-diff/dist/support';

import { addStreamCommands } from '@lensesio/cypress-websocket-testing';

addStreamCommands();

function handleCypressError(error, runnable) {
    const screenshotFilePath = getScreenshotFilePath(runnable);
    const errorMessage = new Error(`${error.message}\n\nScreenshotPath: ${screenshotFilePath}\n\n`);
    errorMessage.name = 'CypressError';
    throw errorMessage;
}

function getScreenshotFilePath(runnable) {
    let screenshotFolder;
    if (Cypress.env('CI')) {
        const JOB_VERSION = String(Cypress.env('CI_JOB_ID'));
        screenshotFolder = `https://gitlab.advsys.work/platform/frontend/-/jobs/${JOB_VERSION}/artifacts/file/packages/frontend/e2e-tests/cypress/screenshots`;
    } else {
        screenshotFolder = 'frontend/packages/frontend/e2e-tests/cypress/screenshots';
    }

    const specName = Cypress.spec.name;
    const screenshotName = `${runnable.parent.title} -- ${runnable.title}`;
    const screenshotNamePath = screenshotName
        .replace(/"/g, '')
        .replace(/:/g, '')
        .replace(/ /g, '%20')
        .replace(/#/g, '%23');
    return `${screenshotFolder}/${specName}/${screenshotNamePath}%20(failed)%20(attempt%202).png`;
}

Cypress.on('fail', (error, runnable) => {
    handleCypressError(error, runnable);
});

Cypress.on('uncaught:exception', (error, runnable) => {
    if (
        error.message.includes("Cannot read properties of null (reading 'is')") ||
        error.message.includes('Dashboard already has the same name: Dashboard will not be renamed')
    ) {
        return false;
    }

    handleCypressError(error, runnable);
});
