import { ETasksTabSelectors } from '@frontend/common/e2e/selectors/backtesting/components/tasks-tab/tasks.tab.selectors';

import { Text } from '../../../../base/elements/text';
import { EContextMenuSelectors } from '../../../common/context.menu';
import { ETableHeaderSelectors, NoRowsToShow } from '../../../common/table/table.header';
const tableTaskNameColumns = [
    'ID',
    'Name',
    'Status',
    'Total runs',
    'Run range',
    'Author',
    'Start Time',
    'End Time',
];

const contextMenuItems = ['Stop', 'Run again', 'Clone', 'Delete'];
class TasksTab {
    readonly tasksTab = new Text(ETasksTabSelectors.TasksTab, false);

    checkVisibleTable(): void {
        const selector = ETasksTabSelectors.TasksTab;
        for (const value of tableTaskNameColumns) {
            cy.contains(selector, value);
        }
        this.tasksTab.get().should('not.contain.text', NoRowsToShow);
    }

    checkVisibleContextMenu(): void {
        cy.get(ETableHeaderSelectors.TableRowText)
            .filter(':contains("NameTask")')
            .last()
            .rightclick();

        cy.get(EContextMenuSelectors.ContextMenu).should('not.contain', 'Delete 2 task');
        contextMenuItems.forEach((item) => {
            cy.get(EContextMenuSelectors.ContextMenu).contains(item);
        });
    }
}

export const tasksTab = new TasksTab();
