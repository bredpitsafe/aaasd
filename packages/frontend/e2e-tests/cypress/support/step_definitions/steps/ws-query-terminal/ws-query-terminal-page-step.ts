import { Given } from '@badeball/cypress-cucumber-preprocessor';

import { configTab } from '../../../../lib/page-objects/trading-servers-manager/components/config-tab/config.tab';
import { wsRequestTab } from '../../../../lib/page-objects/trading-servers-manager/components/ws-request/ws-request.tab';
import { wsQueryTerminalPage } from '../../../../lib/page-objects/ws-query-terminal/ws-query-terminal.page';
import { customWait } from '../../../../lib/web-socket/server';
import { getUuid } from '../../../data/random';
const random = getUuid();

Given(`user types an updated config request in the "Request" input`, () => {
    customWait(5);
    wsQueryTerminalPage.setConfigRequest(random);
    cy.wrap(random).as('requestConfigValue');
});

Given(`user types {string} request in the "Request" input`, (nameRequest: string) => {
    customWait(5);
    switch (nameRequest) {
        case 'ConfigUpdate':
            wsQueryTerminalPage.setConfigRequest(random);
            break;
        case 'ListInstances':
            wsQueryTerminalPage.setRequest(nameRequest);
            break;
        case 'StartComponent':
            wsQueryTerminalPage.setStartComponentRequest(nameRequest);
            break;
    }
});

Given(`user clicks the "Send" button`, () => {
    wsRequestTab.sendButton.click();
    customWait(1);
});

Given(`user clicks the "Run" button in the "Request" tab`, () => {
    customWait(1);
    wsQueryTerminalPage.runRequestButton.click();
});

Given(`user sees the {string} status in the "Response" tab`, (nameStatus: string) => {
    wsQueryTerminalPage.responseTab.checkContain(nameStatus);
});

Given(`user clicks "Clear Unsaved" button in the "History" tab`, () => {
    wsQueryTerminalPage.clearUnsavedButton.click();
});

Given(/user sees the (typed|send) value on the "Config" tab/, (value: string) => {
    switch (value) {
        case 'send':
            cy.get('@configValue').then((object) => {
                const config = object as unknown as string;
                configTab.configForm.checkContain(config);
            });
            break;
        case 'typed':
            cy.get('@requestConfigValue').then((object) => {
                const config = object as unknown as string;
                configTab.configForm.checkContain(config);
            });
            break;
    }
});
