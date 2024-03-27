import { testSelector } from '@frontend/common/e2e';
import { ERunsTabSelectors } from '@frontend/common/e2e/selectors/backtesting/components/runs-tab/runs.tab.selectors';

import { getUuid } from '../../../../../support/data/random';
import { Input } from '../../../../base/elements/input';
import { Text } from '../../../../base/elements/text';
import { customWait } from '../../../../web-socket/server';

const tableRunsNameColumns = [
    'ID',
    'Status',
    'Status Reason',
    'Score',
    'Speed',
    'Progress',
    'Start Time',
    'Approximate End Time',
    'Sim. Current Time (UTC)',
    'Sim. Start Time (UTC)',
    'Sim. End Time (UTC)',
];

class RunsTab {
    readonly runsTab = new Text(ERunsTabSelectors.RunsTab, false);
    readonly scoreIndicatorSearchInput = new Input(ERunsTabSelectors.ScoreIndicatorSearchInput);
    readonly saveScoreIndicatorButton = new Input(ERunsTabSelectors.SaveScoreIndicatorButton);
    readonly deleteScoreIndicatorButton = new Input(
        ERunsTabSelectors.DeleteScoreIndicatorButton,
        false,
    );

    checkVisibleTable(): void {
        const selector = ERunsTabSelectors.RunsTab;
        for (const value of tableRunsNameColumns) {
            cy.contains(selector, value);
        }
        this.runsTab.get().should('not.contain.text', 'No Rows To Show');
    }

    setScoreName(nameIndicator: string) {
        cy.get(testSelector(ERunsTabSelectors.ScoreIndicatorSearchInput)).type(nameIndicator);
        this.scoreIndicatorSearchInput.selectsText(nameIndicator);
    }

    setScoreRandomName() {
        const random = getUuid();
        cy.get(testSelector(ERunsTabSelectors.ScoreIndicatorSearchInput)).type(
            'ScoreIndicator' + random,
        );
        this.scoreIndicatorSearchInput.selectsText('ScoreIndicator' + random);
        cy.wrap('ScoreIndicator' + random).as('scoreIndicator');
        runsTab.saveScoreIndicatorButton.clickForce();
    }

    setTwoScoreName(namesIndicator: string[]) {
        namesIndicator.forEach((nameIndicator) => {
            cy.get(testSelector(ERunsTabSelectors.ScoreIndicatorSearchInput)).type(nameIndicator);
            this.scoreIndicatorSearchInput.selectsText(nameIndicator);
        });
    }

    clearScoreIndicator() {
        cy.get(ERunsTabSelectors.RunsTab).then(($body) => {
            if ($body.find(ERunsTabSelectors.DeleteScoreIndicatorButton).length > 0) {
                this.deleteScoreIndicatorButton.get().each(($element) => {
                    cy.wrap($element).click();
                    customWait(0.2);
                });
            }
        });
    }
}

export const runsTab = new RunsTab();
