import { EStateTabSelectors } from '@frontend/common/e2e/selectors/trading-servers-manager/components/state-tab/state.tab.selectors';

import { Button } from '../../../../base/elements/button';
import { Input } from '../../../../base/elements/input';
import { Text } from '../../../../base/elements/text';

class StateTab {
    readonly applyButton = new Button(EStateTabSelectors.ApplyButton);
    readonly discardButton = new Button(EStateTabSelectors.DiscardButton);
    readonly diffButton = new Button(EStateTabSelectors.DiffButton);
    readonly revisionsSelector = new Input(EStateTabSelectors.RevisionsSelector);
    readonly stateForm = new Text(EStateTabSelectors.StateForm);
    readonly saveIcon = new Text(EStateTabSelectors.SaveIcon, false);
    readonly stateInput = new Input(EStateTabSelectors.StateInput, false);
    readonly serverStateForm = new Input(EStateTabSelectors.ServerStateForm, false);
    readonly editedStateForm = new Input(EStateTabSelectors.EditedStateForm, false);
    readonly revisionsListItem = new Input(EStateTabSelectors.RevisionsListItem, false);

    checkElementsExists(): void {
        this.applyButton.checkExists();
        this.discardButton.checkExists();
        this.diffButton.checkExists();
        this.revisionsSelector.checkExists();
    }

    checkElementsNotEnable(): void {
        this.applyButton.checkNotEnabled();
        this.discardButton.checkNotEnabled();
    }

    checkElementsEnable(): void {
        this.applyButton.checkEnabled();
        this.discardButton.checkEnabled();
    }

    checkVisibleIcon(): void {
        this.saveIcon.get().eq(1).should('be.visible');
        this.saveIcon.get().eq(2).should('be.visible');
    }

    checkNotVisibleIcon(): void {
        // this.saveIcon.get().eq(1).should('not.exist'); wait https://bhft-company.atlassian.net/browse/FRT-2333
        this.saveIcon.get().eq(2).should('not.exist');
    }

    getActualDateRevision(): void {
        this.revisionsSelector.clickLast();
        cy.get(EStateTabSelectors.ActiveRevisions)
            .invoke('text')
            .then((date) => {
                cy.wrap(date).as('actualDate');
            });
    }

    checkNotDateChange(isNotChange: boolean): void {
        this.revisionsSelector.clickLast();
        cy.get('@actualDate').then((object) => {
            const oldDate = object as unknown as string;
            cy.get(EStateTabSelectors.ActiveRevisions)
                .invoke('text')
                .then((newDate) => {
                    if (isNotChange) {
                        expect(newDate).to.equal(oldDate);
                    } else {
                        expect(newDate).to.not.equal(oldDate);
                    }
                });
        });
    }

    checkNotExistLoadingRevisionList() {
        this.revisionsSelector.get().should('not.contain', 'Loading revisions...');
    }

    selectPreviousRevision(): void {
        this.revisionsListItem.get().eq(1).should('be.visible').click();
    }
}

export const stateTab = new StateTab();
