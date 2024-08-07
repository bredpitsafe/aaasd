import { Given } from '@badeball/cypress-cucumber-preprocessor';

import { statusMessagesTab } from '../../../../lib/page-objects/common/components/status-messages/status-messages.tab';
import { ETab } from '../../../../lib/page-objects/common/tab';
import { tableFilter } from '../../../../lib/page-objects/common/table/table.filter';
import { tableHeader } from '../../../../lib/page-objects/common/table/table.header';
import { componentsModal } from '../../../../lib/page-objects/trading-servers-manager/components.modal';
import { activeTasksTab } from '../../../../lib/page-objects/trading-servers-manager/components/active-tasks-tab/active-tasks.tab';
import { addTaskTab } from '../../../../lib/page-objects/trading-servers-manager/components/add-task-tab/add-task.tab';
import { archivedTasksTab } from '../../../../lib/page-objects/trading-servers-manager/components/archived-tasks-tab/archived-tasks.tab';
import { configTab } from '../../../../lib/page-objects/trading-servers-manager/components/config-tab/config.tab';
import { stateTab } from '../../../../lib/page-objects/trading-servers-manager/components/state/state.tab';
import { customWait } from '../../../../lib/web-socket/server';

Given(`user selects the {string} tab on the "Trading Servers Manager" page`, (nameTab: string) => {
    customWait(1);
    tableHeader.checkNotVisibleLoad();
    componentsModal.checkVisibleTabsPanel();
    componentsModal.selectTabByName(nameTab);
    switch (nameTab) {
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
        case ETab.config:
            configTab.checkElementsExists();
            break;
        case ETab.state:
            stateTab.checkElementsExists();
            break;
    }
});
