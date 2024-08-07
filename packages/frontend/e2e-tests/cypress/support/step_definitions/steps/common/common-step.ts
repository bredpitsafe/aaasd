import { Given } from '@badeball/cypress-cucumber-preprocessor';

import { tableHeader } from '../../../../lib/page-objects/common/table/table.header';
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

Given(`user is waiting for the data to load in the table`, () => {
    tableHeader.loadingRowText.checkNotExists();
    tableHeader.checkNotVisibleLoad();
});

Given(
    /user (sees|not sees) the "(.*?)" parameter in the URL/,
    (value: string, urlParams: string) => {
        switch (value) {
            case 'not sees':
                checkNotUrlInclude(urlParams);
                break;
            case 'sees':
                checkUrlInclude(urlParams);
                break;
        }
    },
);
