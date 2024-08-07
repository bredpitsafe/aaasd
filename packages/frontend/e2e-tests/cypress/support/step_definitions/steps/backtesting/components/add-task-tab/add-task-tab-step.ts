import { Given } from '@badeball/cypress-cucumber-preprocessor';

import { addTaskTab } from '../../../../../../lib/page-objects/backtesting/components/add-task-tab/add-task.tab';
import { calendarModal } from '../../../../../../lib/page-objects/common/calendar.modal';
import { tableHeader } from '../../../../../../lib/page-objects/common/table/table.header';
import { customWait } from '../../../../../../lib/web-socket/server';
import { getDataTask } from '../../../../../data/backtesting/getDataTack';

Given(`user checks the {string} tab in the "Add Task" tab`, (nameTap: string) => {
    switch (nameTap) {
        case 'Common':
            addTaskTab.checkVisibleCommonTab();
            break;
        case 'Robots':
            addTaskTab.tabAddRobotButton.clickFirst();
            addTaskTab.checkVisibleRobotsTab();
            addTaskTab.addTaskTab.containsClick('State');
            addTaskTab.stateRobotInput.checkVisible();
            break;
    }
});

Given(`user types random value in the "Common" tab input`, () => {
    addTaskTab.setTaskForm('NameTask_OneRun');
});

Given(`user types date in the calendar from "dataTask" object`, () => {
    const data = getDataTask();
    calendarModal.selectDataInCalendar(data);
});

Given(`user types date in the "Robots" tab`, () => {
    const data = getDataTask();
    addTaskTab.tabAddRobotButton.clickFirst();
    addTaskTab.setRobotsConfig('cypress/fixtures/backtesting/config-robot.xml');
    addTaskTab.createAndRunButton.checkVisible();
    addTaskTab.kindRobotInput.type(data.kindRobot);
    addTaskTab.nameRobotInput.type(data.nameRobot);
});

Given(`user types date in the "Config Template" tab`, () => {
    addTaskTab.setTemplateConfig('cypress/fixtures/backtesting/config-template.xml');
});

Given(`user not sees the "Add Task" tab`, () => {
    addTaskTab.checkElementsNotExists();
});

Given(`user clicks the "Create and Run" button in the "Add Task" tab`, () => {
    addTaskTab.createAndRunButton.checkEnabled();
    tableHeader.loadingImg.checkNotExists();
    addTaskTab.createAndRunButton.click();
});

Given(`user selects server {string} to run the task`, (nameServer: string) => {
    addTaskTab.addTaskSelectServer(nameServer);
    customWait(1);
});

Given(`user selects the {string} tab in the "Add Task" tab`, (nameConfig: string) => {
    switch (nameConfig) {
        case 'Template variables':
            addTaskTab.selectTemplateVariablesConfig();
            break;
        case 'IndicatorRobot':
            addTaskTab.selectRobotTab(nameConfig);
            break;
        case 'Common':
            addTaskTab.selectCommonTab();
            break;
    }
});

Given(`user sees name selected task in the "Clone" tab`, () => {
    const data = getDataTask();
    cy.get('@nameTask').then((object) => {
        const nameTask = object as unknown as string;
        addTaskTab.nameInput.checkHaveValue(nameTask);
        calendarModal.startDateInput.checkHaveValue(data.simStartTimes[0]);
        calendarModal.endDateInput.checkHaveValue(data.simEndTimes[0]);
    });
});

Given(`user sees the {string} error message in the "Add Task" tab`, (massage: string) => {
    addTaskTab.createAndRunButton.clickForce();
    addTaskTab.addTaskTab.checkContain(massage);
});

Given(`user checks the "Create and Run" button not enable`, () => {
    addTaskTab.createAndRunButton.checkVisible();
    addTaskTab.createAndRunButton.checkNotEnabled();
});
