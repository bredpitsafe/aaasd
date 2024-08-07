import { ERunsInfoTabSelectors } from '@frontend/common/e2e/selectors/backtesting/components/runs-info-tab/runs-info.tab.selectors';

import { Input } from '../../../../base/elements/input';
import { Text } from '../../../../base/elements/text';
import { NoRowsToShow } from '../../../common/table/table.header';

const tableRunsInfoNameColumns = [
    'ID',
    'Score',
    'Sim. End Time',
    'Sim. Current Time',
    'instrument',
];

class RunsInfoTab {
    readonly runsInfoTab = new Text(ERunsInfoTabSelectors.RunsInfoTab, false);
    readonly scoreIndicatorSearchInput = new Text(
        ERunsInfoTabSelectors.ScoreIndicatorSearchInput,
        false,
    );
    readonly deleteScoreIndicatorButton = new Input(
        ERunsInfoTabSelectors.DeleteScoreIndicatorButton,
        false,
    );

    checkVisibleTable(): void {
        const selector = ERunsInfoTabSelectors.RunsInfoTab;
        for (const value of tableRunsInfoNameColumns) {
            cy.contains(selector, value);
        }
        this.runsInfoTab.get().should('not.contain.text', NoRowsToShow);
    }

    setTwoScoreName(namesIndicator: string[]) {
        namesIndicator.forEach((nameIndicator) => {
            cy.get(ERunsInfoTabSelectors.ScoreIndicatorSearchInput).type(nameIndicator);
            this.scoreIndicatorSearchInput.selectsByText(nameIndicator);
        });
    }
}

export const runsInfoTab = new RunsInfoTab();
