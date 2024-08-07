import { Given } from '@badeball/cypress-cucumber-preprocessor';
import { testSelector } from '@frontend/common/e2e';
import { EActiveTasksTabSelectors } from '@frontend/common/e2e/selectors/trading-servers-manager/components/active-tasks-tab/active-tasks.tab.selectors';
import { EArchivedTasksTabSelectors } from '@frontend/common/e2e/selectors/trading-servers-manager/components/archived-tasks-tab/aechived-tasks.tab.selectors';

import { THerodotusTerminalTaskData } from '../../../../lib/interfaces/herodotus-terminal/herodotusTerminalTaskData';
import { tasksTabTableRow } from '../../../../lib/page-objects/backtesting/components/tasks-tab/tasks.tab.table.row';
import { confirmModal } from '../../../../lib/page-objects/common/confirm.modal';
import { contextMenu } from '../../../../lib/page-objects/common/context.menu';
import { tableFilter } from '../../../../lib/page-objects/common/table/table.filter';
import { tableHeader } from '../../../../lib/page-objects/common/table/table.header';
import { tableRow } from '../../../../lib/page-objects/common/table/table.row';
import { dashboardPage } from '../../../../lib/page-objects/dashboard/dashboard.page';
import { herodotusTerminalPage } from '../../../../lib/page-objects/herodotus-terminal/herodotus-terminal.page';
import { herodotusTerminalTableRow } from '../../../../lib/page-objects/herodotus-terminal/herodotus-terminal.table.row';
import { activeTasksTab } from '../../../../lib/page-objects/trading-servers-manager/components/active-tasks-tab/active-tasks.tab';
import { addTaskTab } from '../../../../lib/page-objects/trading-servers-manager/components/add-task-tab/add-task.tab';
import { customWait } from '../../../../lib/web-socket/server';
import { getDataTaskNewTask } from '../../../data/herodotus-terminal/getDataTaskNewTask';
import { getDataTaskT0158 } from '../../../data/herodotus-terminal/getDataTaskT0158';
import { getDataTaskT20668 } from '../../../data/herodotus-terminal/getDataTaskT20668';

Given(
    `user selects task by id {string} in the {string} tab`,
    (numberTask: string, nameTab: string) => {
        herodotusTerminalTableRow.selectTaskByIDByNameTab(numberTask, nameTab);
    },
);

Given(
    `user selects the task by id {string} and selects in the context menu of {string} in the {string} tab`,
    (numberTask: string, nameItem: string, nameTab: string) => {
        herodotusTerminalTableRow.rightClickByTaskIDByNameTab(numberTask, nameTab);
        contextMenu.contextMenu.containsClick(nameItem);
    },
);

Given(
    `user selects a new task and selects in the context menu of {string} in the {string} tab`,
    (nameItem: string, nameTab: string) => {
        cy.get('@taskID').then((object) => {
            const nameTask = object as unknown as string;
            herodotusTerminalTableRow.rightClickByTaskIDByNameTab(nameTask, nameTab);
            contextMenu.contextMenu.containsClick(nameItem);
        });
    },
);

Given(`user clicks the {string} button in the {string} table`, (nameButton: string) => {
    herodotusTerminalTableRow.statusTaskRowText.containsClick(nameButton);
});

Given(
    `user selects the task by id {string} and selects in the context menu of {string} and {string} in the {string} tab`,
    (numberTask: string, nameItem: string, nameExport: string, nameTab: string) => {
        herodotusTerminalTableRow.rightClickByTaskIDByNameTab(numberTask, nameTab);
        contextMenu.contextMenu.containsClick(nameItem);
        contextMenu.contextMenu.containsClick(nameExport);
    },
);

Given(`user confirms the creation of the task`, () => {
    confirmModal.clickOkButton();
});

Given(
    `user selects the task by id {string} and checks visibility of the context menu in the {string} tab`,
    (numberTask: string, nameTab: string) => {
        herodotusTerminalTableRow.rightClickByTaskIDByNameTab(numberTask, nameTab);
        contextMenu.checkVisibleContextMenu(nameTab);
    },
);

Given(
    `user selects a new task and checks visibility of the context menu in the {string} tab`,
    (nameTab: string) => {
        herodotusTerminalTableRow.rightClickNewTaskNameTab(nameTab);
        contextMenu.checkVisibleContextMenu(nameTab);
    },
);

Given(`user clicks on the first "Arrow" button in the {string} tab`, (nameTab: string) => {
    customWait(1);
    herodotusTerminalTableRow.clickFirstArrowButton(nameTab);
});

Given(`user clicks on the last "Arrow" button in the {string} tab`, (nameTab: string) => {
    customWait(5);
    herodotusTerminalTableRow.clickLastArrowButton(nameTab);
});

Given(
    `user clicks on the {string} button in the {string} tab`,
    (nameButton: string, nameTab: string) => {
        customWait(1);
        herodotusTerminalPage.clickButtonInNameTab(nameTab, nameButton);
    },
);

Given(`user sees the {string} name in the "Charts" page`, (nameIndicator: string) => {
    dashboardPage.dashboardsCard.contains(nameIndicator);
});

Given(`user sees {string} in the "Robots" menu`, (robotsName: string) => {
    const robotNameList = robotsName.split(',');
    herodotusTerminalPage.robotsMenu.contains('Robots');
    robotNameList.forEach((robotsName) =>
        herodotusTerminalPage.robotsMenu.get().contains(robotsName),
    );
});

Given(`user selects the {string} robot in the "Robots" menu`, (robotsName: string) => {
    herodotusTerminalPage.robotsMenu.containsClick(robotsName);
});

Given(`user opens the "Add Task" tab in the "Herodotus Terminal" page`, () => {
    tableHeader.checkVisibleRowsTable();
    herodotusTerminalPage.addTaskButton.checkVisible();
    herodotusTerminalPage.addTaskButton.click();
});

Given(`user sees the "Add Task" tab in the "Herodotus Terminal" page`, () => {
    addTaskTab.checkElementsExists();
});

Given(`user not sees the "Add Task" tab in the "Herodotus Terminal" page`, () => {
    addTaskTab.addTaskFormButton.checkNotExists();
});

Given(`user clicks the "Reset Layout" button in the "Herodotus Terminal" page`, () => {
    herodotusTerminalPage.resetLayoutButton.click();
});

Given(
    `user types {string} in the input field in ths {string} tab`,
    (typeStatus: string, nameTab: string) => {
        tableHeader.checkVisibleRowsTable();
        switch (nameTab) {
            case 'Active Tasks':
                tableFilter.activeTasksInput.clearAndTypeText(typeStatus);
                customWait(1);
                tableFilter.activeTasksInput.type('{enter}');
                break;
            case 'Archived Tasks':
                tableFilter.archivedTasksInput.clearAndTypeText(typeStatus);
                customWait(1);
                tableFilter.archivedTasksInput.type('{enter}');
                break;
        }
    },
);

Given(`user "paused" all "started" tasks`, () => {
    tableHeader.checkVisibleRowsTable();
    activeTasksTab.changedStatusStartedTaskButton();
    customWait(1);
});

Given(`user sees {string} status in the table on the {string} tab`, (typeStatus: string) => {
    customWait(5);
    herodotusTerminalTableRow.statusTaskRowText.contains(typeStatus);
});

Given(`user sees {string} task in the table on the {string} tab`, (idTask: string) => {
    customWait(5);
    herodotusTerminalTableRow.taskIDRowText.contains(idTask);
});

Given(
    `user not sees {string} status in the table on the "Active Tasks" tab`,
    (typeStatus: string) => {
        customWait(5);
        tableRow.checkAllRowsIsContainStatus(typeStatus, false);
    },
);

Given(
    `user sees {string} type in the table on the {string} tab`,
    (typeStatus: string, nameTab: string) => {
        tableHeader.checkVisibleRowsTable();
        herodotusTerminalTableRow.checkRowContainType(nameTab, typeStatus);
    },
);

Given(
    `user sees the task data with id {string} in the {string} tab`,
    (numberTask: string, nameTab: string) => {
        tableHeader.checkVisibleRowsTable();
        customWait(1);
        let taskData: THerodotusTerminalTaskData;
        switch (numberTask) {
            case '20668':
                taskData = getDataTaskT20668();
                break;
            case '158':
                taskData = getDataTaskT0158();
                break;
        }
        herodotusTerminalTableRow.checkDataTaskByNameTab(taskData, nameTab);
    },
);

Given(
    `user sees additional task data with id {string} in the {string} tab`,
    (numberTask: string, nameTab: string) => {
        tableHeader.checkVisibleRowsTable();
        let taskData: THerodotusTerminalTaskData;
        switch (numberTask) {
            case '20668':
                taskData = getDataTaskT20668();
                break;
            case '158':
                taskData = getDataTaskT0158();
                break;
        }
        herodotusTerminalTableRow.checkAddedDataTaskByNameTab(taskData, nameTab);
    },
);

Given(`user sets {string} value in the last "Aggression" cell`, (valueCell: string) => {
    cy.get(testSelector(EActiveTasksTabSelectors.ActiveTasksTable)).within(() => {
        herodotusTerminalTableRow.aggressionOverrideRowText
            .get()
            .last()
            .dblclick()
            .type('{selectall}')
            .type(valueCell)
            .type('{enter}');
    });
});

Given(`user sees {string} value in the last "Aggression" cell`, (valueCell: string) => {
    cy.get(testSelector(EActiveTasksTabSelectors.ActiveTasksTable)).within(() => {
        herodotusTerminalTableRow.aggressionOverrideRowText.get().last().contains(valueCell);
    });
});

Given(
    `user sees {string} and {string} value in the "Role" cells`,
    (valueCellOne: string, valueCellOTwo: string) => {
        herodotusTerminalTableRow.roleRowText.get().first().contains(valueCellOne);
        herodotusTerminalTableRow.roleRowText.get().last().contains(valueCellOTwo);
    },
);

Given(`user changes the roles value in the "Role" cells`, () => {
    herodotusTerminalTableRow.roleRowText.get().first().dblclick();
    herodotusTerminalTableRow.roleRowText.selectsItemByText('Quote');
    herodotusTerminalTableRow.roleRowText.get().last().dblclick();
    herodotusTerminalTableRow.roleRowText.selectsItemByText('Hedge');
});

Given(`user sees "Save" and "Reset" buttons in the "Status" cell`, () => {
    herodotusTerminalPage.saveRoleButton.checkVisible();
    herodotusTerminalPage.resetRoleButton.checkVisible();
});

Given(`user not sees "Save" and "Reset" buttons in the "Status" cell`, () => {
    herodotusTerminalPage.saveRoleButton.checkNotExists();
    herodotusTerminalPage.resetRoleButton.checkNotExists();
});

Given(`user clicks the "Save" button in the "Status" cell`, () => {
    herodotusTerminalPage.saveRoleButton.click();
});

Given(`user clicks the "Reset" button in the "Status" cell`, () => {
    herodotusTerminalPage.resetRoleButton.click();
});

Given(`user sees {string} value in the {string} cell`, (valueCell: string, nameCell: string) => {
    customWait(1);
    switch (nameCell) {
        case 'Amount':
            herodotusTerminalTableRow.amountRowText.get().first().contains(valueCell);
            break;
        case 'Aggression':
            herodotusTerminalTableRow.aggressionRowText.get().first().contains(valueCell);
            break;
        case 'Order Size':
            herodotusTerminalTableRow.orderSizeRowText.get().first().contains(valueCell);
            break;
        case 'Price Limits':
            herodotusTerminalTableRow.priceLimitRowText.get().first().contains(valueCell);
            break;
    }
});

Given(
    `user not sees {string} value in the {string} cell`,
    (valueCell: string, nameCell: string) => {
        switch (nameCell) {
            case 'Amount':
                herodotusTerminalTableRow.amountRowText
                    .get()
                    .first()
                    .should('not.contain', valueCell);
                break;
            case 'Aggression':
                herodotusTerminalTableRow.aggressionRowText
                    .get()
                    .first()
                    .should('not.contain', valueCell);
                break;
            case 'Order Size':
                herodotusTerminalTableRow.orderSizeRowText
                    .get()
                    .first()
                    .should('not.contain', valueCell);
                break;
            case 'Price Limits':
                herodotusTerminalTableRow.priceLimitRowText
                    .get()
                    .first()
                    .should('not.contain', valueCell);
                break;
        }
    },
);

Given(`user sets {string} value in the {string} cell`, (valueCell: string, nameCell: string) => {
    switch (nameCell) {
        case 'Amount':
            herodotusTerminalTableRow.amountRowText
                .get()
                .first()
                .dblclick()
                .type('{selectall}')
                .type(valueCell)
                .type('{enter}');
            break;
        case 'Aggression':
            herodotusTerminalTableRow.aggressionRowText
                .get()
                .first()
                .dblclick()
                .type('{selectall}')
                .type(valueCell)
                .type('{enter}');
            break;
        case 'Order Size':
            herodotusTerminalTableRow.orderSizeRowText
                .get()
                .first()
                .dblclick()
                .type('{selectall}')
                .type(valueCell)
                .type('{enter}');
            break;
        case 'Price Limits':
            herodotusTerminalTableRow.priceLimitRowText
                .get()
                .first()
                .dblclick()
                .type('{selectall}')
                .type(valueCell)
                .type('{enter}');
            break;
    }
});

Given(`user sees a new task in ths "Active Tasks" tab`, () => {
    customWait(5);
    herodotusTerminalTableRow.getTaskID();
});

Given(`user checks a new task in ths "Active Tasks" tab`, () => {
    herodotusTerminalTableRow.getTaskID();
    const taskData = getDataTaskNewTask();
    herodotusTerminalTableRow.checkDataTask(taskData);
});

Given(`user not sees a new task in ths "Active Tasks" tab`, () => {
    cy.get(testSelector(EActiveTasksTabSelectors.ActiveTasksTable)).within(() => {
        cy.get('@taskID').then((object) => {
            const nameTask = object as unknown as string;
            tasksTabTableRow.checkRowNotContainTaskID(nameTask);
        });
    });
});

Given(`user sees a new task in ths "Archived Tasks" tab`, () => {
    cy.get(testSelector(EArchivedTasksTabSelectors.ArchivedTasksTable)).within(() => {
        cy.get('@taskID').then((object) => {
            const nameTask = object as unknown as string;
            tasksTabTableRow.checkRowContainTaskID(nameTask);
        });
    });
});
