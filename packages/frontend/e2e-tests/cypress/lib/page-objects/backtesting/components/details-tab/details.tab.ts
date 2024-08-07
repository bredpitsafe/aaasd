import { testSelector } from '@frontend/common/e2e';
import { EBacktestingSelectors } from '@frontend/common/e2e/selectors/backtesting/backtesting.page.selectors';
import { EDetailsTabSelectors } from '@frontend/common/e2e/selectors/backtesting/components/details-tab/details.tab.selectors';

import { getUuid } from '../../../../../support/data/random';
import { Text } from '../../../../base/elements/text';
import { customWait } from '../../../../web-socket/server';

class DetailsTab {
    readonly detailsTab = new Text(EDetailsTabSelectors.DetailsTab);
    readonly updateButton = new Text(EDetailsTabSelectors.UpdateButton);
    readonly cloneTaskButton = new Text(EDetailsTabSelectors.CloneTaskButton);
    readonly runAgainTaskButton = new Text(EDetailsTabSelectors.RunAgainTaskButton);
    readonly deleteTaskButton = new Text(EDetailsTabSelectors.DeleteTaskButton);
    readonly stopTaskButton = new Text(EDetailsTabSelectors.StopTaskButton);
    readonly deleteScoreIndicatorInput = new Text(
        EBacktestingSelectors.DeleteScoreIndicatorButton,
        false,
    );

    clearTaskForm() {
        cy.get(testSelector(EBacktestingSelectors.NameInput)).clear();
        cy.get(testSelector(EBacktestingSelectors.DescriptionInput)).clear();
        cy.get(EDetailsTabSelectors.DetailsTab).then(($body) => {
            if ($body.find(EBacktestingSelectors.DeleteScoreIndicatorButton).length > 0) {
                this.deleteScoreIndicatorInput.get().each(($element) => {
                    cy.wrap($element).click();
                    customWait(0.2);
                });
            }
        });
    }

    setTaskForm() {
        const random = getUuid();
        cy.get(testSelector(EBacktestingSelectors.NameInput)).type('TaskForUpdate' + random);
        cy.get(testSelector(EBacktestingSelectors.DescriptionInput)).type('Description' + random);
        cy.get(EDetailsTabSelectors.ScoreIndicatorInput).type('ScoreIndicator' + random);

        cy.wrap('TaskForUpdate' + random).as('nameTask');
        cy.wrap('Description' + random).as('description');
        cy.wrap('ScoreIndicator' + random).as('scoreIndicator');
    }

    setIndicator(nameIndicator: string) {
        cy.get(EDetailsTabSelectors.DetailsTab).then(($body) => {
            if ($body.find(EBacktestingSelectors.DeleteScoreIndicatorButton).length > 0) {
                this.deleteScoreIndicatorInput.get().each(($element) => {
                    cy.wrap($element).click();
                    customWait(0.2);
                });
            }
        });
        cy.get(EDetailsTabSelectors.ScoreIndicatorInput).type(nameIndicator);
    }

    checkTaskForm() {
        cy.get('@nameTask').then((object) => {
            const nameTask = object as unknown as string;
            cy.get(testSelector(EBacktestingSelectors.NameInput)).should('have.value', nameTask);
        });
        cy.get('@description').then((object) => {
            const description = object as unknown as string;
            cy.get(testSelector(EBacktestingSelectors.DescriptionInput)).should(
                'have.value',
                description,
            );
        });
        cy.get('@scoreIndicator').then((object) => {
            const scoreIndicator = object as unknown as string;
            cy.get(EDetailsTabSelectors.ScoreIndicatorInput).should('contain', scoreIndicator);
        });
    }

    getActualNameTaskSetName(nameTask: string) {
        cy.get(testSelector(EBacktestingSelectors.NameInput))
            .invoke('val')
            .then((name) => {
                cy.wrap(name).as(nameTask);
            });
    }
}

export const detailsTab = new DetailsTab();
