import { testSelector } from '@frontend/common/e2e';
import { EHerodotusTerminalSelectors } from '@frontend/common/e2e/selectors/herodotus-terminal/herodotus-terminal.page.selectors';
import { EMainMenuModalSelectors } from '@frontend/common/e2e/selectors/main-menu.modal.selectors';
import { EActiveTasksTabSelectors } from '@frontend/common/e2e/selectors/trading-servers-manager/components/active-tasks-tab/active-tasks.tab.selectors';
import { EArchivedTasksTabSelectors } from '@frontend/common/e2e/selectors/trading-servers-manager/components/archived-tasks-tab/aechived-tasks.tab.selectors';

import {
    getBackendServerUrl,
    getBackendServerUrlByIndex,
} from '../../../support/asserts/comon-url-assert';
import { BasePage } from '../../base.page';
import { Button } from '../../base/elements/button';
import { Text } from '../../base/elements/text';
import { EPagesUrl } from '../../interfaces/url-interfaces';
import { tableFilter } from '../common/table/table.filter';
import { ETableHeaderSelectors } from '../common/table/table.header';
import { EComponentsModalSelectors } from '../trading-servers-manager/components.modal';

const PAGE_URL = EPagesUrl.herodotusTerminal;

class HerodotusTerminalPage extends BasePage {
    readonly mainTitleText = new Text(EHerodotusTerminalSelectors.App);
    readonly addTaskButton = new Button(EMainMenuModalSelectors.AddTaskButton);
    readonly resetLayoutButton = new Button(EMainMenuModalSelectors.ResetLayoutButton);
    readonly robotsButton = new Button(EHerodotusTerminalSelectors.RobotsButton);
    readonly robotsMenu = new Button(EHerodotusTerminalSelectors.RobotsMenu, false);
    readonly activeTasksTab = new Button(EActiveTasksTabSelectors.ActiveTasksTable);
    readonly archivedTasksTab = new Button(EArchivedTasksTabSelectors.ArchivedTasksTable);
    readonly saveRoleButton = new Button(EHerodotusTerminalSelectors.SaveRoleButton);
    readonly resetRoleButton = new Button(EHerodotusTerminalSelectors.ResetRoleButton);

    constructor() {
        super(PAGE_URL);
    }

    checkElementsExists(): void {
        this.mainTitleText.checkExists();
    }

    checkVisibleTabPanel(): void {
        const selector = EComponentsModalSelectors.TabsPanel;
        for (const value of ['Active Tasks', 'Archived Tasks']) {
            cy.contains(selector, value);
        }
    }

    checkTaskTableVisibility(visible: boolean): void {
        const selector = visible
            ? ETableHeaderSelectors.TableText
            : testSelector(EHerodotusTerminalSelectors.App);
        const visibilityAssertion = visible ? 'contain' : 'not.contain.text';
        for (const value of [
            'Id',
            'Type',
            'Amount',
            'Asset',
            'Progress',
            'Realized Premium',
            'Volume',
        ]) {
            cy.get(selector).should(visibilityAssertion, value);
        }
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

    openPageWithBackendServerByIndex(index: string): void {
        const backendServerUrl = getBackendServerUrlByIndex(
            PAGE_URL,
            BasePage.backendServerName,
            index,
        );
        cy.visit(backendServerUrl);
    }

    clickButtonInNameTab(nameTab: string, nameButton: string) {
        const tabSelector = this.tabSelector(nameTab);
        cy.get(testSelector(tabSelector)).within(() => {
            switch (nameButton) {
                case 'CSV':
                    tableFilter.csvButton.click();
                    break;
                case 'TSV':
                    tableFilter.tsvButton.click();
                    break;
                case 'JSON':
                    tableFilter.jsonButton.click();
                    break;
            }
        });
    }

    private tabSelector(nameTab: string): string {
        return nameTab === 'Active Tasks'
            ? EActiveTasksTabSelectors.ActiveTasksTable
            : EArchivedTasksTabSelectors.ArchivedTasksTable;
    }

    AddTab(nameTable: string): void {
        this.addTabButton.click();
        this.contextMenu.containsClick(nameTable);
    }
}

export const herodotusTerminalPage = new HerodotusTerminalPage();
