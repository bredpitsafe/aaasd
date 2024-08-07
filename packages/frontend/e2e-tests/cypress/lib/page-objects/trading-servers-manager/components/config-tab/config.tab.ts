import { EConfigTabSelectors } from '@frontend/common/e2e/selectors/trading-servers-manager/components/config-tab/config.tab.selectors';

import { Button } from '../../../../base/elements/button';
import { Input } from '../../../../base/elements/input';
import { Text } from '../../../../base/elements/text';

export class ConfigTab {
    readonly applyButton = new Button(EConfigTabSelectors.ApplyButton);
    readonly discardButton = new Button(EConfigTabSelectors.DiscardButton);
    readonly diffButton = new Button(EConfigTabSelectors.DiffButton);
    readonly revisionsSelector = new Input(EConfigTabSelectors.RevisionsSelector);
    readonly configForm = new Input(EConfigTabSelectors.ConfigForm);
    readonly configList = new Text(EConfigTabSelectors.ConfigList);
    readonly revisionsInput = new Input(EConfigTabSelectors.RevisionsInput, false);
    readonly revisionsListItem = new Input(EConfigTabSelectors.RevisionsListItem, false);
    readonly configInput = new Input(EConfigTabSelectors.ConfigInput, false);
    readonly serverConfigForm = new Text(EConfigTabSelectors.ServerConfigForm, false);
    readonly editedConfigForm = new Text(EConfigTabSelectors.EditedConfigForm, false);
    readonly colorLine = new Text(EConfigTabSelectors.ColorLine, false);
    readonly saveIcon = new Text(EConfigTabSelectors.SaveIcon, false);
    readonly revisionsList = new Text(EConfigTabSelectors.RevisionsList, false);
    readonly activeRevisions = new Text(EConfigTabSelectors.ActiveRevisions, false);

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

    checkRowsConfigVisible(): void {
        cy.get(EConfigTabSelectors.ColorLine).each(($element) => {
            if ($element.find(EConfigTabSelectors.ColorLine).length > 0) {
                cy.wrap($element).should('be.exist');
                cy.wrap($element).should('be.visible');
            }
        });
    }

    selectPreviousRevision(): void {
        cy.get(EConfigTabSelectors.RevisionsListItem).eq(1).should('be.visible').click();
    }

    getActualDateRevision(): void {
        this.revisionsSelector.click();
        cy.get(EConfigTabSelectors.ActiveRevisions)
            .invoke('text')
            .then((date) => {
                cy.wrap(date).as('actualDate');
            });
    }

    checkNotDateChange(isNotChange: boolean): void {
        this.revisionsSelector.click();
        cy.get('@actualDate').then((object) => {
            const oldDate = object as unknown as string;
            cy.get(EConfigTabSelectors.ActiveRevisions)
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

    setConfig(nameFile: string) {
        cy.readFile(nameFile).then((text) => {
            cy.get(EConfigTabSelectors.ConfigInput).first().type(text, { force: true, delay: 0 });
        });
    }
}

export const configTab = new ConfigTab();
