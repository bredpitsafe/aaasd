import { EBacktestingSelectors } from '@frontend/common/e2e/selectors/backtesting/backtesting.page.selectors';
import { EIndicatorsTabSelectors } from '@frontend/common/e2e/selectors/backtesting/components/indicators-tab/indicators.tab.selectors';
import { EProductLogsTabSelectors } from '@frontend/common/e2e/selectors/backtesting/components/product-logs-tab/product-logs.tab.selectors';
import { EMainMenuModalSelectors } from '@frontend/common/e2e/selectors/main-menu.modal.selectors';

import {
    getBackendServerUrl,
    getServerComponentUrl,
} from '../../../support/asserts/comon-url-assert';
import { BasePage } from '../../base.page';
import { Button } from '../../base/elements/button';
import { Text } from '../../base/elements/text';
import { EPagesUrl } from '../../interfaces/url-interfaces';
import { ETableHeaderSelectors, tableHeader } from '../common/table/table.header';

const PAGE_URL = EPagesUrl.backtesting;

export enum EBacktestingPageSelectors {
    TabsPanel = '[class*=flexlayout__tabset_tabbar_outer]',
}

class BacktestingPage extends BasePage {
    readonly mainTitleText = new Text(EBacktestingSelectors.App);
    readonly addTaskButton = new Button(EMainMenuModalSelectors.AddTaskButton);
    readonly resetLayoutButton = new Button(EMainMenuModalSelectors.ResetLayoutButton);
    readonly tabsPanel = new Text(EBacktestingPageSelectors.TabsPanel, false);
    readonly productLogsTab = new Text(EProductLogsTabSelectors.ProductLogsTab);
    readonly indicatorsTab = new Text(EIndicatorsTabSelectors.IndicatorsTab);

    constructor() {
        super(PAGE_URL);
    }

    checkElementsExists(): void {
        this.mainTitleText.checkExists();
        this.addTaskButton.checkExists();
        this.resetLayoutButton.checkExists();
    }

    checkNotExistsTask(): void {
        this.mainTitleText.get().should('contain.text', 'Loading...');
        tableHeader.loadingRowText.checkVisible();
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

    openPageWithBackendServerByParams(nameServer: string): void {
        const backendServerUrl = getBackendServerUrl(PAGE_URL, nameServer);
        cy.visit(backendServerUrl);
        this.checkElementsExists();
    }

    selectBacktestingTab(nameTab: string): void {
        this.tabsPanel.get().contains(nameTab).click();
    }

    checkVisiblePanel(): void {
        const selector = EBacktestingPageSelectors.TabsPanel;
        for (const value of ['Tasks', 'Dashboards', 'Runs', 'Task', 'Indicators', 'Product Logs']) {
            cy.contains(selector, value);
        }
    }

    openPageServersComponentByName(nameTab: string, idTask): void {
        const serverComponentUrl = getServerComponentUrl(
            PAGE_URL,
            BasePage.backendServerName,
            idTask,
            nameTab,
        );
        cy.visit(serverComponentUrl);
        this.checkElementsExists();
    }

    checkVisibleProductLogsTab(): void {
        const text = ETableHeaderSelectors.TableHeaderText;
        for (const value of ['Time', 'Level', 'Component', 'Message']) {
            cy.contains(text, value);
        }
    }

    checkVisibleIndicatorsTab(): void {
        const text = ETableHeaderSelectors.TableHeaderText;
        for (const value of ['Publisher', 'Name', 'Value', 'Update Time']) {
            cy.contains(text, value);
        }
    }

    checkNotDataIndicatorsTab(): void {
        this.mainTitleText.get().contains('Failed to load data', { timeout: 60000 });
    }

    checkNotDataProductLogsTab(): void {
        this.mainTitleText.get().contains('Failed to load data', { timeout: 60000 });
    }
}

export const backtestingPage = new BacktestingPage();
