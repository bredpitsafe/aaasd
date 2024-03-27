import { Given } from '@badeball/cypress-cucumber-preprocessor';
import { testSelector } from '@frontend/common/e2e';
import { EBacktestingSelectors } from '@frontend/common/e2e/selectors/backtesting/backtesting.page.selectors';
import { ERunsTabSelectors } from '@frontend/common/e2e/selectors/backtesting/components/runs-tab/runs.tab.selectors';

import { ETabUrl } from '../../../../../../lib/interfaces/trading-servers-manager/taps-interfaces';
import { backtestingPage } from '../../../../../../lib/page-objects/backtesting/backtesting.page';
import { addTaskTab } from '../../../../../../lib/page-objects/backtesting/components/add-task-tab/add-task.tab';
import { detailsTab } from '../../../../../../lib/page-objects/backtesting/components/details-tab/details.tab';
import { runsTab } from '../../../../../../lib/page-objects/backtesting/components/runs-tab/runs.tab';
import { runsTabTableRow } from '../../../../../../lib/page-objects/backtesting/components/runs-tab/runs.tab.table.row';
import { tasksTabTableRow } from '../../../../../../lib/page-objects/backtesting/components/tasks-tab/tasks.tab.table.row';
import { contextMenu } from '../../../../../../lib/page-objects/common/context.menu';
import { mainMenuModal } from '../../../../../../lib/page-objects/common/main-menu.modal';
import { ETab } from '../../../../../../lib/page-objects/common/tab';
import { tableHeader } from '../../../../../../lib/page-objects/common/table/table.header';
import { tableRow } from '../../../../../../lib/page-objects/common/table/table.row';
import { customWait } from '../../../../../../lib/web-socket/server';
import { checkUrlInclude } from '../../../../../asserts/comon-url-assert';

Given(`user sees {string} in the "Tasks" table`, () => {
    mainMenuModal.resetLayout.click();
    tableHeader.checkVisibleRowsTable();
    cy.get('@nameTask').then((object) => {
        const nameTask = object as unknown as string;
        tasksTabTableRow.checkRowContainName(nameTask);
    });
});

Given(`user not sees "deleted task" in the "Tasks" table`, () => {
    cy.get('@nameTask').then((object) => {
        const nameTask = object as unknown as string;
        tasksTabTableRow.checkRowNotContainName(nameTask);
    });
});

Given(`user sees two tasks with the same name in the "Tasks" table`, () => {
    cy.get('@nameTask').then((object) => {
        const nameTask = object as unknown as string;
        tasksTabTableRow.checkTwoTaskContainName(nameTask);
    });
});

Given(`user selects the created task in the "Tasks" table`, () => {
    cy.get('@nameTask').then((object) => {
        const nameTask = object as unknown as string;
        tasksTabTableRow.clickRowContainName(nameTask);
    });
});

Given(`user selects last created task in the "Tasks" table`, () => {
    backtestingPage.checkVisiblePanel();
    tableHeader.checkNotVisibleLoading();
    backtestingPage.mainTitleText.checkNotContain('Loading');
    tasksTabTableRow.clickLastRowByName('NameTask_OneRun');
});

Given(`user selects last created task with two runs in the "Tasks" table`, () => {
    backtestingPage.checkVisiblePanel();
    tableHeader.checkNotVisibleLoading();
    backtestingPage.mainTitleText.checkNotContain('Loading');
    tasksTabTableRow.clickLastRowByName('NameTask_TwoRuns');
});

Given(
    `user runs a last created task selects {string} in the context menu`,
    (nameCommand: string) => {
        cy.get('@nameTask').then((object) => {
            const nameTask = object as unknown as string;
            tasksTabTableRow.openMenuTaskByName(nameTask);
            contextMenu.contextMenu.containsClick(nameCommand);
        });
    },
);

Given(
    `user stops a last created task selects {string} in the context menu`,
    (nameCommand: string) => {
        cy.get('@nameTask').then((object) => {
            const nameTask = object as unknown as string;
            tasksTabTableRow.openMenuTaskByName(nameTask);
            contextMenu.contextMenu.containsClick(nameCommand);
        });
    },
);

Given(`user selects task for {string} in the "Tasks" table`, (nameTask: string) => {
    tableHeader.checkVisibleRowsTable();
    backtestingPage.checkVisiblePanel();
    switch (nameTask) {
        case 'One Run':
            tasksTabTableRow.selectTaskByName('TaskOneRun');
            break;
        case 'Update':
            tasksTabTableRow.selectTaskByName('TaskForUpdate');
            break;
        case 'Two Runs':
            tasksTabTableRow.selectTaskByName('TaskTwoRuns');
            break;
    }
});

Given(`user clears and save empty indicators in the "Runs" tab`, () => {
    tableHeader.checkNotVisibleLoading();
    backtestingPage.mainTitleText.checkNotContain('Loading');
    runsTab.clearScoreIndicator();
    customWait(1);
    runsTab.saveScoreIndicatorButton.clickForce();
});

Given(`user types random indicators in the "Runs" tab`, () => {
    backtestingPage.mainTitleText.checkNotContain('Loading');
    runsTab.clearScoreIndicator();
    customWait(1);
    runsTab.setScoreRandomName();
});

Given(`user sees indicators in the "Runs" tab`, () => {
    cy.get('@scoreIndicator').then((object) => {
        const scoreIndicator = object as unknown as string;
        cy.get(testSelector(ERunsTabSelectors.ScoreIndicatorSearchInput)).should(
            'contain',
            scoreIndicator,
        );
    });
    runsTab.deleteScoreIndicatorButton.checkVisible();
    backtestingPage.mainTitleText.checkNotContain('Loading');
});

Given(`user not sees indicators in the "Runs" tab`, () => {
    runsTab.deleteScoreIndicatorButton.checkNotExists();
    backtestingPage.mainTitleText.checkNotContain('Loading');
});

Given(`user sees indicators in the "Details" tab`, () => {
    cy.get('@scoreIndicator').then((object) => {
        const scoreIndicator = object as unknown as string;
        cy.get(testSelector(EBacktestingSelectors.ScoreIndicatorInput)).should(
            'contain',
            scoreIndicator,
        );
    });
    detailsTab.deleteScoreIndicatorInput.checkVisible();
    backtestingPage.mainTitleText.checkNotContain('Loading');
});

Given(`user not sees indicators in the "Details" tab`, () => {
    detailsTab.deleteScoreIndicatorInput.checkNotExists();
    backtestingPage.mainTitleText.checkNotContain('Loading');
});

Given(`user selects first task for "delete" in the "Tasks" table`, () => {
    tableHeader.checkVisibleRowsTable();
    backtestingPage.checkVisiblePanel();
    tasksTabTableRow.clickFirstRow();
    detailsTab.getActualNameTask();
});

Given(`user selects a last created task and remembers its name in the "Tasks" table`, () => {
    tasksTabTableRow.clickLastRowByName('NameTask_OneRun');
    detailsTab.getActualNameTask();
});

Given(`user deletes created tasks in the "Tasks" table`, () => {
    tableHeader.checkVisibleRowsTable();
    tasksTabTableRow.nameRowText.checkContain('NameTask');
    tasksTabTableRow.deleteAllRowsWithoutLastRows(2); // keeping the last  2
});

Given(`user deletes the selected task in the "Tasks" table`, () => {
    cy.get('@nameTask').then((object) => {
        const nameTask = object as unknown as string;
        tasksTabTableRow.deleteRowByName(nameTask);
        customWait(1);
    });
});

Given(`selects an existing task by {string} ID`, (idTask: string) => {
    tableHeader.checkVisibleRowsTable();
    tasksTabTableRow.clickRowContainID(idTask);
    customWait(1);
});

Given(`user opens the "Add Task" via the context menu`, () => {
    runsTab.checkVisibleTable();
    tasksTabTableRow.nameRowText.get().contains('TaskOneRun').rightclick();
    contextMenu.contextMenu.containsClick('Clone');
});

Given(
    `user selects a {string} task and opens "Add Task" via the context menu`,
    (nameTask: string) => {
        runsTab.checkVisibleTable();
        tasksTabTableRow.nameRowText.get().contains(nameTask).rightclick();
        contextMenu.contextMenu.containsClick('Clone');
    },
);

Given(`user clears and types a random value in the {string} task input`, (nameTask: string) => {
    addTaskTab.clearFormTask();
    addTaskTab.setTaskForm(nameTask);
});

Given(
    `user clears and types a random value in the {string} task input for two runs`,
    (nameTask: string) => {
        addTaskTab.clearFormTask();
        addTaskTab.setTaskForm(nameTask);
    },
);

Given(
    `user goes on the "Backtesting Manager" page with the selected {string} tab for task by {string} ID`,
    (nameTab: string, idTask) => {
        backtestingPage.openPageServersComponentByName(nameTab, idTask);
        customWait(1);
    },
);

Given(
    `user sees that the "Dashboard" link contains the {string} number of the "Run"`,
    (nameRun: string) => {
        tableRow.dashboardLinkText
            .get()
            .last()
            .should(($element) => {
                expect($element.is('a')).to.be.true;
                expect($element.attr('href')).to.contain(nameRun);
            });
    },
);

Given(`user sees that the "Dashboard" link has changed`, () => {
    tableRow.dashboardLinkText
        .get()
        .last()
        .should(($element) => {
            expect($element.is('a')).to.be.true;
            expect($element.attr('href')).to.not.contain('17738');
            expect($element.attr('href')).to.not.contain('17830');
        });
});

Given(`user sees that the "Dashboard" link is equal to the number of the "Run"`, () => {
    runsTabTableRow.getActualNameRun();
    cy.get('@nameRun').then((object) => {
        const nameRun = object as unknown as string;
        tableRow.dashboardLinkText
            .get()
            .last()
            .should(($element) => {
                expect($element.is('a')).to.be.true;
                expect($element.attr('href')).to.contain(nameRun);
            });
    });
});

Given(`user sees the {string} tab on the "Backtesting Manager"`, (nameTab: string) => {
    tableHeader.checkNotVisibleLoading();
    backtestingPage.checkVisiblePanel();
    switch (nameTab) {
        case ETab.indicators:
            checkUrlInclude(ETabUrl.indicators);
            backtestingPage.checkVisibleIndicatorsTab();
            break;
        case ETab.productLogs:
            checkUrlInclude(ETabUrl.productLogs);
            backtestingPage.checkVisibleProductLogsTab();
            break;
    }
});

Given(`user not sees data on the {string} tab`, (nameTab: string) => {
    backtestingPage.checkVisiblePanel();
    switch (nameTab) {
        case ETab.indicators:
            backtestingPage.checkNotDataIndicatorsTab();
            break;
        case ETab.productLogs:
            backtestingPage.checkNotDataProductLogsTab();
            break;
    }
});

Given(`user sees the {string} status in the "Tasks" tab`, (nameStatus: string) => {
    cy.get('@nameTask').then((object) => {
        const nameTask = object as unknown as string;
        tasksTabTableRow.checkStatusTask(nameTask, nameStatus);
    });
});

Given(`user clicks on the {string} in the "Details" tab`, (nameButton: string) => {
    customWait(1);
    switch (nameButton) {
        case 'CloneTask':
            detailsTab.cloneTaskButton.clickForce();
            break;
        case 'DeleteTask':
            detailsTab.deleteTaskButton.clickForce();
            break;
        case 'RunAgainTask':
            detailsTab.runAgainTaskButton.clickForce();
            break;
        case 'StopTask':
            detailsTab.stopTaskButton.clickForce();
            break;
    }
});

Given(`user changes the task data in the "Details" tab`, () => {
    detailsTab.clearTaskForm();
    detailsTab.setTaskForm();
    detailsTab.updateButton.click();
});

Given(`user types {string} indicator in the "Details" tab`, (nameIndicators: string) => {
    backtestingPage.mainTitleText.checkNotContain('Loading');
    detailsTab.setIndicator(nameIndicators);
    detailsTab.updateButton.click();
});
