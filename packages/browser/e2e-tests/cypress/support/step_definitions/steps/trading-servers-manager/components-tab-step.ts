import { Given } from '@badeball/cypress-cucumber-preprocessor';

import { statusMessagesTab } from '../../../../lib/page-objects/common/components/status-messages/status-messages.tab';
import { ETab } from '../../../../lib/page-objects/common/tab';
import { tableFilter } from '../../../../lib/page-objects/common/table/table.filter';
import { componentsModal } from '../../../../lib/page-objects/trading-servers-manager/components.modal';
import { activeTasksTab } from '../../../../lib/page-objects/trading-servers-manager/components/active-tasks-tab/active-tasks.tab';
import { addTaskTab } from '../../../../lib/page-objects/trading-servers-manager/components/add-task-tab/add-task.tab';
import { archivedTasksTab } from '../../../../lib/page-objects/trading-servers-manager/components/archived-tasks-tab/archived-tasks.tab';
import { customWait } from '../../../../lib/web-socket/server';

Given(`user selects the {string} tab`, (tapName: string) => {
    customWait(1);
    componentsModal.checkVisibleTabsPanel();
    componentsModal.selectTabByName(tapName);
    switch (tapName) {
        case ETab.addTask:
            addTaskTab.checkElementsExists();
            break;
        case ETab.activeTasks:
            activeTasksTab.checkElementsExists();
            break;
        case ETab.archivedTasks:
            archivedTasksTab.checkElementsExists();
            break;
        case ETab.statusMessages:
            statusMessagesTab.checkElementsExists();
            break;
        case ETab.indicators:
        case ETab.realAccounts:
        case ETab.virtualAccounts:
            tableFilter.checkElementsExists();
            break;
    }
    componentsModal.checkVisibleTabsPanel();
    customWait(1);
});
