import { Given } from '@badeball/cypress-cucumber-preprocessor';

import { backtestingPage } from '../../../../lib/page-objects/backtesting/backtesting.page';
import { addTaskTab } from '../../../../lib/page-objects/backtesting/components/add-task-tab/add-task.tab';
import { detailsTab } from '../../../../lib/page-objects/backtesting/components/details-tab/details.tab';
import { runsInfoTabTableRow } from '../../../../lib/page-objects/backtesting/components/runs-info-tab/runs-info.tab.table.row';
import { runsTabTableRow } from '../../../../lib/page-objects/backtesting/components/runs-tab/runs.tab.table.row';
import { tasksTab } from '../../../../lib/page-objects/backtesting/components/tasks-tab/tasks.tab';
import { tasksTabTableRow } from '../../../../lib/page-objects/backtesting/components/tasks-tab/tasks.tab.table.row';
import { ETab } from '../../../../lib/page-objects/common/tab';
import { customWait } from '../../../../lib/web-socket/server';
import { getDataTask } from '../../../data/backtesting/getDataTack';

Given(`user sees the "Backtesting" page`, () => {
    backtestingPage.checkElementsExists();
});

Given(`user clicks the "Add Task" button in the menu "Backtesting Manager"`, () => {
    backtestingPage.checkVisiblePanel();
    tasksTab.checkVisibleTable();
    backtestingPage.addTaskButton.click();
});

Given(`user sees the {string} tab in the "Backtesting Manager" page`, (nameTab: string) => {
    addTaskTab.checkElementsVisible(nameTab);
});

Given(`user clears the {string} input field`, (nameInput: string) => {
    customWait(1);
    switch (nameInput) {
        case 'Name':
        case 'Description':
        case 'Robot Name':
        case 'Robot Kind':
            addTaskTab.clearTaskFieldByName(nameInput);
            break;
        case 'Config template':
        case 'Robot Config':
            addTaskTab.clearConfigTaskFieldByName(nameInput);
            break;
    }
});

Given(`user types invalid config in the {string} input field`, (nameInput: string) => {
    customWait(1);
    switch (nameInput) {
        case 'Config template':
            addTaskTab.setTemplateConfig(
                'cypress/fixtures/backtesting/config-template-invalid.txt',
            );
            break;
        case 'Template variables':
            addTaskTab.setTemplateVariables('{/}');
            break;
        case 'Robot Config':
            addTaskTab.setRobotsConfig('cypress/fixtures/backtesting/config-robot-invalid.txt');
            break;
    }
});

Given(`user sees the data {string} in the {string} tab`, (name: string, nameTap: string) => {
    const data = getDataTask();
    switch (nameTap) {
        case ETab.tasks:
            tasksTabTableRow.checkTaskData(data);
            break;
        case ETab.runs:
            runsTabTableRow.checkRunsData(data);
            break;
        case ETab.runsInfo:
            runsInfoTabTableRow.checkRunsInfoData(data);
            break;
    }
});

Given(`user sees the data of the {string} in the "Tasks" tab`, () => {
    detailsTab.checkTaskForm();
});

Given(`user not sees "Delete 2 task" in the context menu of the task`, () => {
    tasksTab.checkVisibleContextMenu();
});
