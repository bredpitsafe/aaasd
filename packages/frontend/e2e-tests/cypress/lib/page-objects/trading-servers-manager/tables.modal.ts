import { testSelector } from '@frontend/common/e2e';
import { EMainMenuModalSelectors } from '@frontend/common/e2e/selectors/main-menu.modal.selectors';
import { ETablesModalSelectors } from '@frontend/common/e2e/selectors/trading-servers-manager/tables.modal.selectors';

import { Button } from '../../base/elements/button';
import { Table } from '../../base/elements/table/table';
import { Text } from '../../base/elements/text';
import { ETableHeaderSelectors } from '../common/table/table.header';

export class TablesModal {
    readonly componentName = new Text(ETablesModalSelectors.ComponentName);
    readonly addTabButton = new Button(EMainMenuModalSelectors.AddTabButton);
    readonly serverTable = new Text(ETablesModalSelectors.ServerTable);
    readonly execGatesTable = new Table(ETablesModalSelectors.ExecGatesTable);
    readonly mgGatesTable = new Table(ETablesModalSelectors.MGGatesTable);
    readonly robotsTable = new Table(ETablesModalSelectors.RobotsTable);
    readonly addComponent = new Text(ETablesModalSelectors.AddComponent);
    readonly addTabContextMenu = new Text(ETablesModalSelectors.AddTabContextMenu, false);
    readonly playIcon = new Text(ETablesModalSelectors.PlayIcon, false);
    readonly closeIcon = new Text(ETablesModalSelectors.CloseIcon, false);
    readonly pausedIcon = new Text(ETablesModalSelectors.PausedIcon, false);

    addTab(nameTab: string) {
        this.addTabContextMenu.containsClick(nameTab);
    }

    checkVisibleIcon(nameIcon: string) {
        switch (nameIcon) {
            case 'failed':
                cy.get(testSelector(ETablesModalSelectors.ExecGatesTable)).within(() =>
                    this.closeIcon.checkVisible(),
                );
                break;
            case 'enabled':
                cy.get(testSelector(ETablesModalSelectors.ExecGatesTable)).within(() =>
                    this.playIcon.checkVisible(),
                );
                break;
        }
    }

    checkVisibleStatusComponent(nameStatus: string, nameComponent: string, nameTable: string) {
        const tableSelector = this.getTableSelector(nameTable);
        const iconSelector = this.getIconSelector(nameStatus);

        cy.get(testSelector(tableSelector)).within(() =>
            cy
                .get(ETableHeaderSelectors.TableRowText)
                .filter(`:contains("${nameComponent}")`)
                .get(ETablesModalSelectors[iconSelector])
                .should('be.visible'),
        );
    }

    private getTableSelector(nameTable) {
        switch (nameTable) {
            case 'Robots':
                return ETablesModalSelectors.RobotsTable;
            case 'MD Gates':
                return ETablesModalSelectors.MGGatesTable;
            case 'Exec Gates':
                return ETablesModalSelectors.ExecGatesTable;
        }
    }

    private getIconSelector(nameStatus: string) {
        switch (nameStatus) {
            case 'Enabled':
            case 'Play':
                return 'PlayIcon';
            case 'Disabled':
            case 'Paused':
                return 'PausedIcon';
            case 'Failed':
            case 'Close':
                return 'CloseIcon';
        }
    }

    clickAddComponent(nameTable: string) {
        let selector;
        switch (nameTable) {
            case 'Robots':
                selector = testSelector(ETablesModalSelectors.RobotsTable);
                break;
            case 'MD Gates':
                selector = testSelector(ETablesModalSelectors.MGGatesTable);
                break;
            case 'Exec Gates':
                selector = testSelector(ETablesModalSelectors.ExecGatesTable);
                break;
        }
        cy.get(selector).within(() => {
            this.addComponent.click();
        });
    }

    checkAddComponent(nameTable: string, nameComponent) {
        let selector;
        switch (nameTable) {
            case 'Robots':
                selector = testSelector(ETablesModalSelectors.RobotsTable);
                break;
            case 'MD Gates':
                selector = testSelector(ETablesModalSelectors.MGGatesTable);
                break;
            case 'Exec Gates':
                selector = testSelector(ETablesModalSelectors.ExecGatesTable);
                break;
        }
        cy.get(selector).contains(nameComponent);
    }
}

export const tablesModal = new TablesModal();
