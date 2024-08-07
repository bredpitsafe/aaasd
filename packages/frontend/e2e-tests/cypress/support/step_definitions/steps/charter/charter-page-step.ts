import { Given } from '@badeball/cypress-cucumber-preprocessor';

import { charterPage } from '../../../../lib/page-objects/charter/charter.page';
import { customWait } from '../../../../lib/web-socket/server';

Given(`user goes to the "Charter" page with a {string} graph`, (graphName: string) => {
    charterPage.visitByGraphName(graphName);
    charterPage.checkElementsExists();
});

Given(`user checks the {string} graph`, (graphName: string) => {
    customWait(2);
    charterPage.doScreenshot(graphName);
});
