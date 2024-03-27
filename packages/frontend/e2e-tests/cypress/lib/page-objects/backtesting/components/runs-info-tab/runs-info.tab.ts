import { ERunsInfoTabSelectors } from '@frontend/common/e2e/selectors/backtesting/components/runs-info-tab/runs-info.tab.selectors';

import { Text } from '../../../../base/elements/text';

const tableRunsInfoNameColumns = [
    'ID',
    'Score',
    'Sim. End Time (UTC)',
    'Sim. Current Time (UTC)',
    'instrument',
];

class RunsInfoTab {
    readonly runsInfoTab = new Text(ERunsInfoTabSelectors.RunsInfoTab, false);

    checkVisibleTable(): void {
        const selector = ERunsInfoTabSelectors.RunsInfoTab;
        for (const value of tableRunsInfoNameColumns) {
            cy.contains(selector, value);
        }
        this.runsInfoTab.get().should('not.contain.text', 'No Rows To Show');
    }
}

export const runsInfoTab = new RunsInfoTab();
