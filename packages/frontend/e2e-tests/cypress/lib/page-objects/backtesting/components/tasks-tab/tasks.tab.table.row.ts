import { ETasksTabSelectors } from '@frontend/common/e2e/selectors/backtesting/components/tasks-tab/tasks.tab.selectors';

import { Text } from '../../../../base/elements/text';
import { TDataTask } from '../../../../interfaces/backtesting/dataTack';
import { confirmModal } from '../../../common/confirm.modal';
import { contextMenu } from '../../../common/context.menu';
import { ETableHeaderSelectors } from '../../../common/table/table.header';
import { ETableBodySelectors, TableRow } from '../../../common/table/table.row';
import { ETableRowSelectors } from '../../../common/table/table.row-selectors';

export enum ETasksTabTableRowSelectors {
    TotalRunsText = `${ETableBodySelectors.TableBody} [col-id="totalBtRuns"]`,
}

export class TasksTabTableRow extends TableRow {
    readonly totalRunsText = new Text(ETasksTabTableRowSelectors.TotalRunsText, false);

    checkTaskData(data: TDataTask): void {
        cy.get(ETasksTabSelectors.TasksTab).within(() => {
            this.idRowText.checkContain(data.taskId);
            this.totalRunsText.checkContain(data.totalRuns);
        });
    }

    checkRowContainName(nameTask: string) {
        this.nameRowText.checkContain(nameTask);
    }

    checkTwoTaskContainName(nameTask: string) {
        this.nameRowText.get().should('contain', nameTask).should('have.length.above', 1);
    }

    checkRowNotContainName(nameTask: string) {
        this.nameRowText.checkNotContain(nameTask);
    }

    clickRowContainName(nameTask: string) {
        this.nameRowText.get().contains(nameTask).click();
    }

    clickRowContainID(idTask: string) {
        this.idRowText.get().contains(idTask).click();
    }

    checkRowNotContainID(idTask: string) {
        this.idRowText.checkNotContain(idTask);
    }

    checkRowContainTaskID(idTask: string) {
        this.taskIDRowText.checkContain(idTask);
    }

    checkRowNotContainTaskID(idTask: string) {
        this.taskIDRowText.checkNotContain(idTask);
    }

    clickLastRowByName(nameTask: string) {
        cy.get(ETableHeaderSelectors.TableRowText)
            .filter(':contains("Finished")')
            .filter(`:contains("${nameTask}")`)
            .first()
            .click();
    }

    openMenuTaskByName(nameTask: string) {
        cy.get(ETableRowSelectors.NameRowText).contains(`${nameTask}`).first().rightclick();
    }

    getActualIDLastTask(idTask: string): void {
        cy.get(ETableRowSelectors.NameRowText)
            .filter(`:contains("NameTask")`)
            .first()
            .trigger('click', { ctrlKey: true })
            .siblings(ETableRowSelectors.IDRowText)
            .invoke('text')
            .then((id) => {
                cy.wrap(id).as(idTask);
            });
    }

    getActualIDFirstTask(idTask: string): void {
        cy.get(ETableRowSelectors.NameRowText)
            .filter(`:contains("NameTask")`)
            .last()
            .click()
            .siblings(ETableRowSelectors.IDRowText)
            .invoke('text')
            .then((id) => {
                cy.wrap(id).as(idTask);
            });
    }

    getActualIDTwoTask(): void {
        this.getActualIDFirstTask('idTask');
        this.getActualIDLastTask('idTwoTask');
    }

    selectTaskByName(taskName: string) {
        cy.get(ETableHeaderSelectors.TableRowText).contains(taskName).click();
    }

    deleteTaskByID(idTask: string): void {
        cy.get(ETableHeaderSelectors.TableRowText)
            .contains(idTask)
            .first()
            .then(($row) => {
                cy.wrap($row).rightclick();
                contextMenu.contextMenu.containsClick('Delete');
                confirmModal.clickOkButton();
            });
    }

    deleteTwoTaskByName(nameTask: string): void {
        cy.get(ETableHeaderSelectors.TableRowText)
            .contains(nameTask)
            .first()
            .then(($row) => {
                cy.wrap($row).rightclick();
                contextMenu.contextMenu.containsClick('Delete 2 task');
                confirmModal.clickOkButton();
            });
    }

    deleteAllRowsWithoutLastRows(count: number): void {
        cy.get(ETableHeaderSelectors.TableRowText)
            .filter(':contains("NameTask")')
            .then(($rows) => {
                const rowsToDelete = Math.max(0, $rows.length - count);
                for (let i = 0; i < rowsToDelete; i++) {
                    const $row = $rows.eq(i);
                    cy.wrap($row).rightclick();
                    contextMenu.contextMenu.containsClick('Delete');
                    confirmModal.clickOkButton();
                }
            });
    }

    deleteAllCanceledTask(): void {
        cy.get(ETableRowSelectors.StatusTaskRowText).then(($rows) => {
            const canceledRows = $rows.filter(':contains("Canceled")');
            if (canceledRows.length === 0) {
                return;
            }
            const rowsToDelete = Math.max(0, canceledRows.length);
            for (let i = 0; i < rowsToDelete; i++) {
                const $row = canceledRows.eq(i);
                cy.wrap($row).rightclick();
                contextMenu.contextMenu.containsClick('Delete');
                confirmModal.clickOkButton();
            }
        });
    }

    checkStatusTask(nameTask: string, nameStatus: string): void {
        cy.get(ETableRowSelectors.NameRowText)
            .contains(nameTask)
            .siblings(ETableRowSelectors.StatusTaskRowText)
            .contains(nameStatus, { timeout: 120000 })
            .should('be.visible');
    }

    checkTwoRunTaskData(): void {
        cy.get(ETasksTabSelectors.TasksTab).within(() => {
            this.totalRunsText.checkContain('2');
        });
    }
}

export const tasksTabTableRow = new TasksTabTableRow();
