import { Given } from '@badeball/cypress-cucumber-preprocessor';

import { EGates } from '../../../../../../lib/interfaces/trading-servers-manager/md-gates-interfaces';
import { tableHeader } from '../../../../../../lib/page-objects/common/table/table.header';
import { ETime } from '../../../../../../lib/page-objects/common/time';
import { configTab } from '../../../../../../lib/page-objects/trading-servers-manager/components/config-tab/config.tab';
import { tradingServersManagerPage } from '../../../../../../lib/page-objects/trading-servers-manager/trading-servers-manager.page';
import { customWait } from '../../../../../../lib/web-socket/server';
import { dateChange, previousDayFromDate } from '../../../../../data/date';
import { getUuid } from '../../../../../data/random';

const lastDate = '2023-08-31';

Given(`user sets a {string} account in the config`, (typeConfig: string) => {
    const random = getUuid();
    configTab.configInput.clear();
    switch (typeConfig) {
        case 'non-existing':
            configTab.setConfig('cypress/fixtures/config/binanceSpot-invalid.xml');
            break;
        case 'existing':
            configTab.setConfig('cypress/fixtures/config/binanceSpot.xml');
            break;
    }
    configTab.configInput.type('<!-- ' + random + '--');
    configTab.applyButton.checkEnabled();
    configTab.applyButton.click();
});

Given(`user types a random value in the "Config" form`, () => {
    const random = getUuid();
    const textToType = `<!-- ${random} -->`;
    customWait(1);
    configTab.configInput.clear();
    configTab.configInput.type(textToType);
    cy.wrap(random).as('configValue');
    configTab.applyButton.checkEnabled();
    configTab.configForm.checkContain(random);
});

Given(`user clicks on the {string} button in the "Config" form`, (nameButton: string) => {
    switch (nameButton) {
        case 'Discard':
            configTab.discardButton.click();
            break;
        case 'Apply':
            configTab.applyButton.click();
    }
});

Given(`user selects a "selectAll" value in the config`, () => {
    tableHeader.checkNotVisibleLoad();
    configTab.configInput.clickForce();
    customWait(1);
    configTab.configInput.type('{selectAll}');
});

Given(/user (sees|not sees) the selection indicator in the "Config" form/, (value: string) => {
    switch (value) {
        case 'not sees':
            configTab.colorLine.checkNotExists();
            break;
        case 'sees':
            configTab.checkRowsConfigVisible();
            break;
    }
});

Given(/user (sees|not sees) the active elements on the "Config" tab/, (value: string) => {
    switch (value) {
        case 'not sees':
            configTab.checkElementsNotEnable();
            configTab.checkNotVisibleIcon();
            break;
        case 'sees':
            configTab.checkElementsEnable();
            configTab.checkVisibleIcon();
            break;
    }
});

Given(/user (sees|not sees) the typed config value on the "Config" tab/, (value: string) => {
    cy.get('@configValue').then((object) => {
        const config = object as unknown as string;
        switch (value) {
            case 'not sees':
                configTab.configForm.checkNotContain(config);
                break;
            case 'sees':
                configTab.configForm.contains(config);
                break;
        }
    });
});

Given(`user types random the config input`, () => {
    const random = getUuid();
    configTab.configInput.clear();
    configTab.configInput.type('<!-- ' + random + '--');
});

Given(`user sees the actual date in the revisions list`, () => {
    configTab.getActualDateRevision();
});

Given(/user checks that the actual date (not |)change on the "Config" tab/, (value: string) => {
    customWait(1);
    configTab.revisionsSelector.checkNotContain('Select revision');
    if (value === 'not ') {
        configTab.checkNotDateChange(true);
    } else {
        configTab.checkNotDateChange(false);
    }
});

Given(`user clicks on the revision selector and check that the last date is selected`, () => {
    configTab.revisionsSelector.click();
    configTab.revisionsList.checkVisible();
    configTab.configList.contains(lastDate);
});

Given(`user sees a revisions list and the last revision`, () => {
    configTab.activeRevisions.checkContain(lastDate);
    let previousDate = previousDayFromDate(lastDate);
    configTab.revisionsList.checkContain(previousDate);
    previousDate = previousDayFromDate(previousDate);
    configTab.revisionsList.checkContain(previousDate);
});

Given(
    `user selects the {string} revision from the config list revisions`,
    (nameRevision: string) => {
        configTab.checkNotExistLoadingRevisionList();
        customWait(1);
        // configTab.revisionsInput.click();
        configTab.revisionsInput
            .get()
            // .invoke('attr', 'contenteditable', 'true')
            .type(nameRevision, { force: true, delay: 0 });
        configTab.revisionsList.containsClick(nameRevision);
        configTab.configList.contains(nameRevision);
    },
);

Given(`user selects the previous date from the config list revisions`, () => {
    configTab.revisionsSelector.click();
    configTab.selectPreviousRevision();
});

Given(`user sees the {string} selected revision version`, (nameRevision: string) => {
    configTab.revisionsSelector.click();
    configTab.activeRevisions.checkContain(nameRevision);
    configTab.configList.contains(nameRevision);
    configTab.checkElementsEnable();
});

Given(`user clicks on the "Diff" switch button in the "Config" form`, () => {
    configTab.diffButton.clickLast();
});

Given(`user sees today's date in the revisions list`, () => {
    configTab.revisionsSelector.click();
    configTab.activeRevisions.checkVisible();
    configTab.activeRevisions.checkContain(dateChange(ETime.Now));
});

Given(`user selects the last revision from the config list revisions`, () => {
    configTab.revisionsSelector.click();
    customWait(1);
    configTab.revisionsListItem.clickFirst();
});

Given(`user not sees typed config value`, () => {
    configTab.checkElementsNotEnable();
});

Given(`user goes on the "Config" page with {string} param`, (urlParam: string) => {
    tradingServersManagerPage.visitByTab(
        `gate/${EGates.BinanceSwap}?tab=Config&createTab=true&${urlParam}`,
    );
});

Given(`the user clicks back button twice`, () => {
    cy.go('back').then(() => cy.go('back'));
});

Given(`ser clicks a Apply button in the "Config" form`, () => {
    configTab.applyButton.checkEnabled();
    configTab.applyButton.click();
});

Given(
    /user (sees|not sees) the types random value in the "Edited config" form/,
    (value: string) => {
        cy.get('@configValue').then((object) => {
            const state = object as unknown as string;
            switch (value) {
                case 'not sees':
                    configTab.editedConfigForm.checkNotContain(state);
                    break;
                case 'sees':
                    configTab.editedConfigForm.contains(state);
                    break;
            }
        });
    },
);

Given(
    /user (sees|not sees) the types random value in the "Server config" form/,
    (value: string) => {
        cy.get('@configValue').then((object) => {
            const state = object as unknown as string;
            switch (value) {
                case 'not sees':
                    configTab.serverConfigForm.checkNotContain(state);
                    break;
                case 'sees':
                    configTab.serverConfigForm.contains(state);
                    break;
            }
        });
    },
);

Given(
    `user sets the {string} configuration for the "md_indicator" "Robot"`,
    (kindConfig: string) => {
        const random = getUuid();
        configTab.configInput.clear();
        switch (kindConfig) {
            case 'correct':
                configTab.setConfig('cypress/fixtures/config/StatusMessageRobot.xml');
                configTab.configInput.type('<!-- ' + random + '--');
                break;
            case 'incorrect':
                configTab.configInput.type('<!-- ' + random + '--');
                break;
        }
        configTab.applyButton.checkEnabled();
        configTab.applyButton.click();
    },
);

Given(
    `user sets the {string} configuration for the "Deribit" "Exec Gate"`,
    (kindConfig: string) => {
        const random = getUuid();
        configTab.configInput.clear();
        switch (kindConfig) {
            case 'correct':
                configTab.setConfig('cypress/fixtures/config/deribit-execGate.xml');
                configTab.configInput.type('<!-- ' + random + '--');
                break;
            case 'incorrect':
                configTab.configInput.type('<!-- ' + random + '--');
                break;
        }
        configTab.applyButton.checkEnabled();
        configTab.applyButton.click();
    },
);
