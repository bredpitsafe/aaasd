import { EStatusMessagesTabSelectors } from '@frontend/common/e2e/selectors/trading-servers-manager/components/status-messages-tab/status-messages.tab.selectors';

import { Button } from '../../../../base/elements/button';
import { TableHeader } from '../../table/table.header';

class StatusMessagesTab extends TableHeader {
    readonly statusMessagesBody = new Button(EStatusMessagesTabSelectors.StatusMessagesBody);
    readonly statusMessagesText = new Button(EStatusMessagesTabSelectors.StatusMessagesText);

    checkElementsExists() {
        this.statusMessagesBody.checkExists();
    }

    checkNotMessages() {
        this.statusMessagesBody.checkContain('No status messages yet');
    }
}

export const statusMessagesTab = new StatusMessagesTab();
