import { EBacktestingSelectors } from '@frontend/common/e2e/selectors/backtesting/backtesting.page.selectors';
import { ERunsTabSelectors } from '@frontend/common/e2e/selectors/backtesting/components/runs-tab/runs.tab.selectors';

import { getUuid } from '../../../../../support/data/random';
import { Input } from '../../../../base/elements/input';
import { Text } from '../../../../base/elements/text';
import { customWait } from '../../../../web-socket/server';
import { NoRowsToShow } from '../../../common/table/table.header';

const tableRunsNameColumns = [
    'ID',
    'Status',
    'Status Reason',
    'Score',
    'Speed',
    'Progress',
    'Start Time',
    'Approximate End Time',
    'Sim. Current Time',
    'Sim. Start Time',
    'Sim. End Time',
];

class RunsTab {
    readonly runsTab = new Text(ERunsTabSelectors.RunsTab, false);
    readonly scoreIndicatorSearchInput = new Input(ERunsTabSelectors.ScoreIndicatorSearchInput);
    readonly saveScoreIndicatorButton = new Input(
        ERunsTabSelectors.SaveScoreIndicatorButton,
        false,
    );
    readonly deleteScoreIndicatorButton = new Input(
        ERunsTabSelectors.DeleteScoreIndicatorButton,
        false,
    );

    checkVisibleTable(): void {
        const selector = ERunsTabSelectors.RunsTab;
        for (const value of tableRunsNameColumns) {
            cy.contains(selector, value);
        }
        this.runsTab.get().should('not.contain.text', NoRowsToShow);
    }

    setScoreName(nameIndicator: string) {
        cy.get(ERunsTabSelectors.ScoreIndicatorSearchInput).type(nameIndicator);
        this.scoreIndicatorSearchInput.selectsByText(nameIndicator);
    }

    setScoreRandomName() {
        const random = getUuid();
        cy.get(ERunsTabSelectors.ScoreIndicatorSearchInput).type('ScoreIndicator' + random);
        this.scoreIndicatorSearchInput.selectsByText('ScoreIndicator' + random);
        cy.wrap('ScoreIndicator' + random).as('scoreIndicator');
        runsTab.saveScoreIndicatorButton.clickForce();
    }

    setTwoScoreName(namesIndicator: string[]) {
        namesIndicator.forEach((nameIndicator) => {
            cy.get(ERunsTabSelectors.ScoreIndicatorSearchInput).type(nameIndicator);
            this.scoreIndicatorSearchInput.selectsByText(nameIndicator);
        });
    }

    clearScoreIndicator() {
        cy.get(ERunsTabSelectors.RunsTab).then(($body) => {
            if ($body.find(EBacktestingSelectors.DeleteScoreIndicatorButton).length > 0) {
                this.deleteScoreIndicatorButton.get().each(($element) => {
                    cy.wrap($element).click();
                    customWait(0.2);
                });
            }
        });
    }
}

export const runsTab = new RunsTab();
