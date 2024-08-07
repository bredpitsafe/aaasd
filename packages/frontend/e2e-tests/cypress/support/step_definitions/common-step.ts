import { Given } from '@badeball/cypress-cucumber-preprocessor';

import { BasePage } from '../../lib/base.page';
import { EServer } from '../../lib/interfaces/server/server-interfaces';
import { mainMenuModal } from '../../lib/page-objects/common/main-menu.modal';
import { customWait } from '../../lib/web-socket/server';

Given(`user selects the {string} server`, (nameServer: string) => {
    switch (nameServer) {
        case 'default':
            BasePage.backendServerName = Cypress.env('backendServerName') as EServer;
            break;
        case 'autotest':
            Cypress.env('backendServerName', 'autotest');
            Cypress.env('webSocketUrl', 'wss://ms.advsys.work/autotest/');
            BasePage.backendServerName = Cypress.env('backendServerName') as EServer;
            break;
        case 'qa':
            Cypress.env('backendServerName', 'qa');
            Cypress.env('webSocketUrl', 'wss://ms.advsys.work/qa/');
            BasePage.backendServerName = Cypress.env('backendServerName') as EServer;
            break;
        case 'preprod':
            Cypress.env('backendServerName', 'preprod');
            Cypress.env('webSocketUrl', 'wss://ms.advsys.work/preprod/');
            BasePage.backendServerName = Cypress.env('backendServerName') as EServer;
            break;
        case 'helix':
            Cypress.env('backendServerName', 'helix');
            Cypress.env('webSocketUrl', 'wss://ms.advsys.work/helix/');
            BasePage.backendServerName = Cypress.env('backendServerName') as EServer;
            break;
        case 'hypercube':
            Cypress.env('backendServerName', 'hypercube');
            Cypress.env('webSocketUrl', 'wss://ms.advsys.work/hypercube/');
            BasePage.backendServerName = Cypress.env('backendServerName') as EServer;
            break;
        case 'atf-dev':
            Cypress.env('backendServerName', 'atf-dev');
            Cypress.env('webSocketUrl', 'wss://ms.advsys.work/atf-dev/');
            BasePage.backendServerName = Cypress.env('backendServerName') as EServer;
            break;
    }
});

Given(`user changes the server to {string}`, (nameServer: string) => {
    mainMenuModal.selectServer(nameServer);
    customWait(1);
});

Given(`user sets the "2100" to "1400" screen size`, () => {
    cy.viewport(2560, 1600);
});
