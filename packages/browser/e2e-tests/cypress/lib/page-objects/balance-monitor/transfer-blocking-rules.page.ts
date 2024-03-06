import { BasePage, EBasePagePageSelectors } from '../../base.page';
import { EPagesUrl } from '../../interfaces/url-interfaces';

const PAGE_URL = EPagesUrl.balanceMonitor;

class TransferBlockingRulesPage extends BasePage {
    constructor() {
        super(PAGE_URL);
    }

    checkVisiblePanel(): void {
        const selector = EBasePagePageSelectors.TabsPanel;
        for (const value of ['Add Transfer Blocking Rule', 'Transfer Blocking Rules']) {
            cy.contains(selector, value);
        }
    }
}

export const transferBlockingRulesPage = new TransferBlockingRulesPage();
