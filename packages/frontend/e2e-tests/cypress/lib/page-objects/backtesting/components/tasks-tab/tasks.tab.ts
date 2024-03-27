import { ETasksTabSelectors } from '@frontend/common/e2e/selectors/backtesting/components/tasks-tab/tasks.tab.selectors';

import { Text } from '../../../../base/elements/text';

const tableTaskNameColumns = [
    'ID',
    'Name',
    'Status',
    'Total runs',
    'Run range',
    'Author',
    'Start Time (UTC)',
    'End Time (UTC)',
];

class TasksTab {
    readonly tasksTab = new Text(ETasksTabSelectors.TasksTab, false);

    checkVisibleTable(): void {
        const selector = ETasksTabSelectors.TasksTab;
        for (const value of tableTaskNameColumns) {
            cy.contains(selector, value);
        }
        this.tasksTab.get().should('not.contain.text', 'No Rows To Show');
    }
}

export const tasksTab = new TasksTab();
