import { Given } from '@badeball/cypress-cucumber-preprocessor';

import { customWait } from '../../../../lib/web-socket/server';
import { checkNotUrlInclude, checkUrlInclude } from '../../../asserts/comon-url-assert';
import { setNetworkModeOff, setNetworkModeOn } from '../../../network/setNetworkModes';

Given(`user sets the Internet off`, () => {
    setNetworkModeOff();
});

Given(`user sets the Internet on`, () => {
    setNetworkModeOn();
});

Given(`user waits for {string} seconds`, (timeValue: number) => {
    customWait(timeValue);
});

Given(`user reload a page`, () => {
    cy.reload();
    customWait(1);
});

Given(/user (sees|not sees) the "filter" parameter in the URL/, (value: string) => {
    switch (value) {
        case 'not sees':
            checkNotUrlInclude('filter=');
            break;
        case 'sees':
            checkUrlInclude('filter=');
            break;
    }
});
