import { BasePage, EBasePagePageSelectors } from '../../base.page';
import { EPagesUrl } from '../../interfaces/url-interfaces';

const PAGE_URL = EPagesUrl.balanceMonitor;

class AmountLimitsRulesPage extends BasePage {
    constructor() {
        super(PAGE_URL);
    }

    checkVisiblePanel(): void {
        const selector = EBasePagePageSelectors.TabsPanel;
        for (const value of ['Add Amount Limits Rule', 'Amount Limits Rules']) {
            cy.contains(selector, value);
        }
    }
}

export const amountLimitsRulesPage = new AmountLimitsRulesPage();
