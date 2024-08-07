import { ECharterTestSelectors } from '@frontend/common/e2e/selectors/charter-test/charter-test.page.selectors';

import { BasePage } from '../../base.page';
import { UIElement } from '../../base/ui-element';
import { EPagesUrl } from '../../interfaces/url-interfaces';

const PAGE_URL = EPagesUrl.charter;

class CharterPage extends BasePage {
    readonly dataPage = new UIElement(ECharterTestSelectors.Charter);

    constructor() {
        super(PAGE_URL);
    }

    checkElementsExists(): void {
        this.dataPage.checkExists();
    }

    visitByGraphName(graphName?: string): void {
        setBaseUrl();
        cy.visit(`${PAGE_URL}/?case=${graphName}`);
        this.dataPage.checkVisible();
    }

    doScreenshot(graphName?: string): void {
        this.dataPage.get().first().screenshot(`${graphName} #0`);
        this.dataPage.checkVisible();
        this.dataPage.get().matchImage({
            maxDiffThreshold: 0.001,
            title: graphName,
            matchAgainstPath: `cypress/e2e/charter/__image_snapshots__/${graphName} #0.png`,
        });
    }
}

function setBaseUrl() {
    if (Cypress.config('baseUrl') !== Cypress.env('baseUrlCharter'))
        Cypress.config('baseUrl', Cypress.env('baseUrlCharter'));
}

export const charterPage = new CharterPage();
