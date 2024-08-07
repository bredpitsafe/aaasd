import { Given } from '@badeball/cypress-cucumber-preprocessor';

import { tableFilter } from '../../../../../../lib/page-objects/common/table/table.filter';
import { tableHeader } from '../../../../../../lib/page-objects/common/table/table.header';
import { activeTasksTab } from '../../../../../../lib/page-objects/trading-servers-manager/components/active-tasks-tab/active-tasks.tab';
import { archivedTasksTab } from '../../../../../../lib/page-objects/trading-servers-manager/components/archived-tasks-tab/archived-tasks.tab';

Given(`user checks the {string} task existence`, (taskType: string) => {
    switch (taskType) {
        case 'Buy':
            tableFilter.nameInput.type(taskType);
            break;
        case 'Sell':
            tableFilter.nameInput.type(taskType);
            break;
    }
    tableFilter.nameInput.type('{enter}');
});

Given(`user archive active tasks`, () => {
    tableHeader.checkVisibleRowsTable();
    activeTasksTab.changedStatusStartedTask();
    activeTasksTab.archiveAllRows();
});

Given(`user deletes archive tasks`, () => {
    tableHeader.checkVisibleRowsTable();
    archivedTasksTab.deleteAllRowsExceptOne();
});

Given(`user deletes all archive tasks`, () => {
    tableHeader.checkVisibleRowsTable();
    archivedTasksTab.deleteAllRowsExcept(0);
});
