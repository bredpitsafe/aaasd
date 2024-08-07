import { EBalanceMonitorSelectors } from '@frontend/common/e2e/selectors/balance-monitor/balance-monitor.page.selectors';

import {
    getBackendServerUrl,
    getBackendServerUrlAndTabUrl,
} from '../../../support/asserts/comon-url-assert';
import { BasePage, EBasePagePageSelectors } from '../../base.page';
import { Button } from '../../base/elements/button';
import { Input } from '../../base/elements/input';
import { Text } from '../../base/elements/text';
import { EPagesBalanceMonitorUrl } from '../../interfaces/balance-monitor/page-interfaces';
import { EPagesUrl } from '../../interfaces/url-interfaces';

const PAGE_URL = EPagesUrl.balanceMonitor;

class BalanceMonitorPage extends BasePage {
    readonly mainTitleText = new Text(EBalanceMonitorSelectors.App);
    readonly balanceMonitorButton = new Button(EBalanceMonitorSelectors.BalanceMonitorButton);
    readonly internalTransfersButton = new Button(EBalanceMonitorSelectors.InternalTransfersButton);
    readonly transferBlockingRulesButton = new Button(
        EBalanceMonitorSelectors.TransferBlockingRulesButton,
    );
    readonly amountLimitsRulesButton = new Button(EBalanceMonitorSelectors.AmountLimitsRulesButton);
    readonly autoTransferRules = new Button(EBalanceMonitorSelectors.AutoTransferRules);
    readonly componentStatusesButton = new Button(EBalanceMonitorSelectors.ComponentStatusesButton);
    readonly coinFilterSelector = new Input(EBalanceMonitorSelectors.CoinFilterSelector);
    readonly pumpAndDumpButton = new Button(EBalanceMonitorSelectors.PumpAndDumpButton);

    constructor() {
        super(PAGE_URL);
    }

    openPageWithBackendServer(): void {
        const backendServerUrl = getBackendServerUrl(PAGE_URL, BasePage.backendServerName);
        cy.visit(backendServerUrl);
    }

    openPageByBackendServer(nameServer: string): void {
        const backendServerUrl = getBackendServerUrl(PAGE_URL, nameServer);
        cy.visit(backendServerUrl);
    }

    openPageWithBackendServerByTabName(nameTab: string): void {
        const backendServerUrl = getBackendServerUrlAndTabUrl(
            PAGE_URL,
            BasePage.backendServerName,
            EPagesBalanceMonitorUrl.balanceMonitor,
            nameTab,
        );
        cy.visit(backendServerUrl);
    }

    checkElementsExists(): void {
        this.mainTitleText.checkExists();
        this.tabsPanel.checkExists();
        this.balanceMonitorButton.checkExists();
        this.internalTransfersButton.checkExists();
        this.transferBlockingRulesButton.checkExists();
        this.amountLimitsRulesButton.checkExists();
        this.autoTransferRules.checkExists();
        this.componentStatusesButton.checkExists();
    }

    visit(url?: string): Cypress.Chainable<Cypress.AUTWindow> {
        const defaultUrl = url ?? '';
        return cy.visit(this.pageUrl + defaultUrl);
    }

    openPageServersByName(namePage: string): void {
        const pageUrl = EPagesBalanceMonitorUrl[namePage as keyof typeof EPagesBalanceMonitorUrl];
        cy.visit(`${PAGE_URL}/${BasePage.backendServerName}/${pageUrl}/`);
    }

    openPageByBackendServerName(namePage: string, nameServer: string): void {
        const pageUrl = EPagesBalanceMonitorUrl[namePage as keyof typeof EPagesBalanceMonitorUrl];
        cy.visit(`${PAGE_URL}/${nameServer}/${pageUrl}/`);
    }

    checkVisiblePanel(): void {
        const selector = EBasePagePageSelectors.TabsPanel;
        for (const value of [
            'Suggested Transfers',
            'Transfers History',
            'Coin Transfer Details',
            'Manual Transfer',
            'Send data to analyse',
            'Distribution',
        ]) {
            cy.contains(selector, value);
        }
    }
}

export const balanceMonitorPage = new BalanceMonitorPage();
