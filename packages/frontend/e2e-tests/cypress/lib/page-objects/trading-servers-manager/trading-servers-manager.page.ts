import { ETradingServersManagerSelectors } from '@frontend/common/e2e/selectors/trading-servers-manager/trading-servers-manager.page.selectors';

import {
    getBackendServerUrl,
    getServerComponentTabUrl,
    getServerTabUrl,
} from '../../../support/asserts/comon-url-assert';
import { BasePage } from '../../base.page';
import { Button } from '../../base/elements/button';
import { Text } from '../../base/elements/text';
import { EServer } from '../../interfaces/server/server-interfaces';
import { ERobots } from '../../interfaces/trading-servers-manager/robots-interfaces';
import { EPagesUrl } from '../../interfaces/url-interfaces';
import { contextMenu } from '../common/context.menu';
import { NoRowsToShow } from '../common/table/table.header';
import { EComponentsModalSelectors } from './components.modal';
import { TablesModal } from './tables.modal';
const PAGE_URL = EPagesUrl.tradingServersManager;
const tabPanelItems = [
    'Indicators',
    'Instruments',
    'Virtual Accounts',
    'Real Accounts',
    'Product Logs',
    'Order Book',
];

class TradingServersManagerPage extends BasePage {
    readonly mainTitleText = new Text(ETradingServersManagerSelectors.App);
    readonly tablesModal = new TablesModal();
    readonly contextMenuItemButton = new Button(
        ETradingServersManagerSelectors.ContextMenuItemButton,
        false,
    );

    constructor() {
        super(PAGE_URL);
    }

    checkElementsExists(): void {
        this.mainTitleText.checkExists();
    }

    openPageWithBackendServer(): void {
        const backendServerUrl = getBackendServerUrl(PAGE_URL, BasePage.backendServerName);
        cy.visit(backendServerUrl);
        this.checkElementsExists();
    }

    openPageByBackendServer(nameServer: string): void {
        const backendServerUrl = getBackendServerUrl(PAGE_URL, nameServer);
        cy.visit(backendServerUrl);
    }

    openPageRobotComponentByName(componentName: ERobots): void {
        const backendServerId = EServer[BasePage.backendServerName];
        const tab_URL = `/${backendServerId}/robot/${ERobots[componentName]}`;
        const backendServerUrl = getServerTabUrl(PAGE_URL, BasePage.backendServerName, tab_URL);
        cy.visit(backendServerUrl);
        this.checkElementsExists();
    }

    openPageRobotByTabAndNumberRobot(nameTab: string, nameRobot: string): void {
        const backendServerId = EServer[BasePage.backendServerName];
        const tab_URL = `/${backendServerId}/robot/${nameRobot}?tab=${nameTab}`;
        const backendServerUrl = getServerTabUrl(PAGE_URL, BasePage.backendServerName, tab_URL);
        cy.visit(backendServerUrl);
        this.checkElementsExists();
    }

    openPageServersTapByName(nameTab: string): void {
        const backendServerId = EServer[BasePage.backendServerName];
        const tab_URL = `/${backendServerId}?tab=${nameTab}`;
        const backendServerUrl = getServerTabUrl(PAGE_URL, BasePage.backendServerName, tab_URL);
        cy.visit(backendServerUrl);
        this.checkElementsExists();
    }

    checkVisibleTabPanel(): void {
        const text = EComponentsModalSelectors.TabsPanel;
        for (const value of tabPanelItems) {
            cy.contains(text, value);
        }
        this.mainTitleText.get().should('not.contain.text', NoRowsToShow);
    }

    checkNotVisibleTabPanel(): void {
        tabPanelItems.forEach((item) => {
            this.mainTitleText.get().should('not.contain.text', item);
        });
    }
    checkVisibleLoading(): void {
        this.mainTitleText.get().should('not.contain.text', 'Loading components list...');
    }

    checkVisibleRobotMenu(): void {
        const menuItems = ['Start', 'Stop', 'Restart', 'Unblock', 'Remove'];
        menuItems.forEach((item) => contextMenu.contextMenu.contains(item));
    }

    checkVisibleGateMenu(): void {
        const menuItems = ['Start', 'Stop', 'Restart', 'Remove'];
        menuItems.forEach((item) => contextMenu.contextMenu.contains(item));
    }

    visitByTab(nameTap: string): void {
        const backendServerId = EServer[BasePage.backendServerName];

        const backendServerUrl = getServerComponentTabUrl(
            PAGE_URL,
            BasePage.backendServerName,
            backendServerId,
            nameTap,
        );
        cy.visit(backendServerUrl);
    }
}

export const tradingServersManagerPage = new TradingServersManagerPage();
