import { Given } from '@badeball/cypress-cucumber-preprocessor';

import { stateTab } from '../../../../../../lib/page-objects/trading-servers-manager/components/state/state.tab';
import { customWait } from '../../../../../../lib/web-socket/server';
import { getUuid } from '../../../../../data/random';

Given(/user (sees|not sees) the active elements on the "State" tab/, (value: string) => {
    switch (value) {
        case 'not sees':
            stateTab.checkElementsNotEnable();
            stateTab.checkNotVisibleIcon();
            break;
        case 'sees':
            stateTab.checkElementsEnable();
            stateTab.checkVisibleIcon();
            break;
    }
});

Given(`user types a random value in the "State" form`, () => {
    const random = getUuid();
    customWait(1);
    const textToType = `//${random}`;
    stateTab.stateInput.get().type(textToType, { force: true, delay: 0 });
    stateTab.stateInput.type('{enter}');
    cy.wrap(random).as('stateValue');
});

Given(`user clear types a random state value in the "State" form`, () => {
    const random = getUuid();
    const textToType = `{\n  "comments": [ "${random}" ]`;
    stateTab.stateInput.clear();
    stateTab.stateInput.type(textToType, 0);
    cy.wrap(random).as('stateValue');
});

Given(`user sees the types random value in the "State" form`, () => {
    cy.get('@stateValue').then((object) => {
        const state = object as unknown as string;
        stateTab.stateForm.contains(state);
    });
});

Given(`user sees the actual date in the revisions list on the "State" tab`, () => {
    stateTab.getActualDateRevision();
});

Given(/user checks that the actual date (not |)change on the "State" tab/, (value: string) => {
    customWait(3);
    stateTab.revisionsSelector.checkNotContain('Select revision');
    if (value === 'not ') {
        stateTab.checkNotDateChange(true);
    } else {
        stateTab.checkNotDateChange(false);
    }
});

Given(`user clicks on the {string} button in the "State" form`, (nameButton: string) => {
    switch (nameButton) {
        case 'Discard':
            stateTab.discardButton.clickLast();
            break;
        case 'Apply':
            stateTab.applyButton.clickLast();
            break;
    }
});

Given(`user clicks on the "Diff" switch button in the "State" form`, () => {
    stateTab.diffButton.clickLast();
});

Given(`user selects the previous date from the state list revisions`, () => {
    stateTab.revisionsSelector.clickLast();
    stateTab.selectPreviousRevision();
});

Given(`user selects the last revision from the state list revisions`, () => {
    stateTab.revisionsSelector.clickLast();
    customWait(1);
    stateTab.revisionsListItem.clickFirst();
});

Given(`user sees the selected previous date in the revision list`, () => {});

Given(/user (sees|not sees) the typed state value on the "State" tab/, (value: string) => {
    cy.get('@stateValue').then((object) => {
        const state = object as unknown as string;
        switch (value) {
            case 'not sees':
                stateTab.stateForm.checkNotContain(state);
                break;
            case 'sees':
                stateTab.stateForm.contains(state);
                break;
        }
    });
});

Given(/user (sees|not sees) the types random value in the "Edited state" form/, (value: string) => {
    cy.get('@stateValue').then((object) => {
        const state = object as unknown as string;
        switch (value) {
            case 'not sees':
                stateTab.editedStateForm.checkNotContain(state);
                break;
            case 'sees':
                stateTab.editedStateForm.contains(state);
                break;
        }
    });
});

Given(/user (sees|not sees) the types random value in the "Server state" form/, (value: string) => {
    cy.get('@stateValue').then((object) => {
        const state = object as unknown as string;
        switch (value) {
            case 'not sees':
                stateTab.serverStateForm.checkNotContain(state);
                break;
            case 'sees':
                stateTab.serverStateForm.contains(state);
                break;
        }
    });
});
