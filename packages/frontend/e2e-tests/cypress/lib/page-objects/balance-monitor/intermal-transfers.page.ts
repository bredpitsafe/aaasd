import { BasePage, EBasePagePageSelectors } from '../../base.page';
import { EPagesUrl } from '../../interfaces/url-interfaces';

const PAGE_URL = EPagesUrl.balanceMonitor;

class InternalTransfersPage extends BasePage {
    constructor() {
        super(PAGE_URL);
    }

    checkVisiblePanel(): void {
        const selector = EBasePagePageSelectors.TabsPanel;
        for (const value of ['Internal Transfers', 'Internal Transfers History']) {
            cy.contains(selector, value);
        }
    }
}

export const internalTransfersPage = new InternalTransfersPage();
