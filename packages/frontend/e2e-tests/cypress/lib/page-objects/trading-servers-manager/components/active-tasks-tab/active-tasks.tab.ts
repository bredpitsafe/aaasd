import { testSelector } from '@frontend/common/e2e';
import { EActiveTasksTabSelectors } from '@frontend/common/e2e/selectors/trading-servers-manager/components/active-tasks-tab/active-tasks.tab.selectors';

import { Rows } from '../../../../base/elements/rows';
import { confirmModal } from '../../../common/confirm.modal';
import { contextMenu } from '../../../common/context.menu';
import { TableRow } from '../../../common/table/table.row';
import { ETableRowSelectors } from '../../../common/table/table.row-selectors';

class ActiveTasksTab extends TableRow {
    readonly activeTasksTable = new Rows(EActiveTasksTabSelectors.ActiveTasksTable);

    checkElementsExists(): void {
        this.activeTasksTable.checkExists();
    }

    archiveAllRows(): void {
        const row = ETableRowSelectors.StatusTaskRowText;
        cy.get(testSelector(EActiveTasksTabSelectors.ActiveTasksTable))
            .should('be.visible')
            .then(($element) => {
                if ($element.find(row).length > 0) {
                    cy.get(row).each(($elem) => {
                        const rowText = $elem.text();
                        if (rowText.includes('paused')) {
                            cy.wrap($elem).rightclick();
                            contextMenu.contextMenu.containsClick('Archive');
                            confirmModal.clickOkButton();
                        }
                    });
                }
            });
    }

    changedStatusStartedTask(): void {
        const row = ETableRowSelectors.StatusTaskRowText;
        cy.get(testSelector(EActiveTasksTabSelectors.ActiveTasksTable))
            .should('be.visible')
            .then(($element) => {
                if ($element.find(row).length > 0) {
                    cy.get(row).each(($elem) => {
                        const rowText = $elem.text();
                        if (rowText.includes('started')) {
                            cy.wrap($elem).rightclick();
                            contextMenu.contextMenu.containsClick('Pause');
                        }
                    });
                }
            });
    }

    changedStatusStartedTaskButton(): void {
        const row = ETableRowSelectors.StatusTaskRowText;
        cy.get(testSelector(EActiveTasksTabSelectors.ActiveTasksTable))
            .should('be.visible')
            .then(($element) => {
                if ($element.find(row).length > 0) {
                    cy.get(row).each(($elem) => {
                        const rowText = $elem.text();
                        if (rowText.includes('started')) {
                            cy.wrap($elem).click();
                        }
                    });
                }
            });
    }
}

export const activeTasksTab = new ActiveTasksTab();
