import { testSelector } from '@frontend/common/e2e';
import { EComponentStatusesTabSelectors } from '@frontend/common/e2e/selectors/balance-monitor/components/component-statuses/component-statuses.tab.selectors';

import { Text } from '../../../../base/elements/text';

const tableTaskNameColumns = ['Component Id', 'Status', 'Description'];

class ComponentStatusesTab {
    readonly componentStatusesTab = new Text(EComponentStatusesTabSelectors.ComponentStatusesTab);

    checkVisibleTable(): void {
        const selector = testSelector(EComponentStatusesTabSelectors.ComponentStatusesTab);
        for (const value of tableTaskNameColumns) {
            cy.contains(selector, value);
        }
    }
}

export const componentStatusesTab = new ComponentStatusesTab();
