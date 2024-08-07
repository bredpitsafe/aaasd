import { testSelector } from '@frontend/common/e2e';
import { EArchivedTasksTabSelectors } from '@frontend/common/e2e/selectors/trading-servers-manager/components/archived-tasks-tab/aechived-tasks.tab.selectors';

import { Rows } from '../../../../base/elements/rows';
import { confirmModal } from '../../../common/confirm.modal';
import { contextMenu } from '../../../common/context.menu';
import { EHerodotusTerminalTableRowSelectors } from '../../../herodotus-terminal/herodotus-terminal.table.row';

class ArchivedTasksTab {
    readonly archivedTasksTable = new Rows(EArchivedTasksTabSelectors.ArchivedTasksTable);

    checkElementsExists(): void {
        this.archivedTasksTable.checkExists();
    }

    deleteAllRowsExcept(number: number): void {
        const row = EHerodotusTerminalTableRowSelectors.FinishedRowText;
        cy.get(testSelector(EArchivedTasksTabSelectors.ArchivedTasksTable))
            .should('be.visible')
            .then(($element) => {
                const $rows = $element.find(row);
                if ($rows.length > number) {
                    for (let i = 0; i < $rows.length - number; i++) {
                        cy.wrap($rows[i]).rightclick();
                        contextMenu.contextMenu.containsClick('Delete');
                        confirmModal.clickOkButton();
                    }
                }
            });
    }

    deleteAllRowsExceptOne(): void {
        const row = EHerodotusTerminalTableRowSelectors.FinishedRowText;
        cy.get(testSelector(EArchivedTasksTabSelectors.ArchivedTasksTable))
            .should('be.visible')
            .then(($element) => {
                const $rows = $element.find(row);
                if ($rows.length > 1) {
                    for (let i = 1; i < $rows.length; i++) {
                        cy.wrap($rows[i]).rightclick();
                        contextMenu.contextMenu.containsClick('Delete');
                        confirmModal.clickOkButton();
                    }
                }
            });
    }
}

export const archivedTasksTab = new ArchivedTasksTab();
