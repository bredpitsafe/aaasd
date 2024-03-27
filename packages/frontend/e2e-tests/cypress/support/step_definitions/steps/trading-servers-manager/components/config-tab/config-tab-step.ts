import { Given } from '@badeball/cypress-cucumber-preprocessor';

import { EGates } from '../../../../../../lib/interfaces/trading-servers-manager/md-gates-interfaces';
import { ETime } from '../../../../../../lib/page-objects/common/time';
import { configTab } from '../../../../../../lib/page-objects/trading-servers-manager/components/config-tab/config.tab';
import { tradingServersManagerPage } from '../../../../../../lib/page-objects/trading-servers-manager/trading-servers-manager.page';
import { customWait } from '../../../../../../lib/web-socket/server';
import { checkNotUrlInclude, checkUrlInclude } from '../../../../../asserts/comon-url-assert';
import { dateChange, previousDayFromDate } from '../../../../../data/date';
import { getUuid } from '../../../../../data/random';

const lastDate = '2023-08-31';

Given(`user types a random value in the config for save`, () => {
    const random = getUuid();
    const textToType = `<!--${random} -->\n<robot kind="trading_tasks">\n    </robot`;
    customWait(1);
    configTab.configInput.clear();
    configTab.configInput.get().type(textToType, { force: true, delay: 0 });
    cy.wrap(random).as('configValue');
    configTab.applyButton.checkEnabled();
});

Given(`user sets a {string} account in the config`, (typeConfig: string) => {
    customWait(1);
    configTab.configInput.clear();
    switch (typeConfig) {
        case 'non-existing':
            configTab.setConfig('cypress/fixtures/config/binanceSpot-invalid.xml');
            break;
        case 'existing':
            configTab.setConfig('cypress/fixtures/config/binanceSpot.xml');
            break;
    }
    customWait(1);
    configTab.configInput.type('{del}');
    configTab.applyButton.checkEnabled();
});

Given(`user types a random value in the config`, () => {
    const random = getUuid();
    const textToType = `<!-- ${random} -->`;
    customWait(1);
    configTab.configInput.get().type(textToType, { force: true, delay: 0 });
    cy.wrap(random).as('configValue');
    configTab.applyButton.checkEnabled();
    configTab.configForm.checkContain(random);
});

Given(`user selects a "selectAll" value in the config`, () => {
    configTab.configInput.clickForce();
    customWait(1);
    configTab.configInput.type('{selectAll}');
});

Given(/user (sees|not sees) the selection indicator/, (value: string) => {
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
            // configTab.checkNotVisibleIcon(); https://bhft-company.atlassian.net/browse/FRT-1804
            break;
        case 'sees':
            configTab.checkElementsEnable();
            // configTab.checkVisibleIcon(); https://bhft-company.atlassian.net/browse/FRT-1804
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

Given(`user clicks on the "Diff" button`, () => {
    configTab.diffButton.checkEnabled();
    configTab.diffButton.click();
});

Given(`user types random the config input`, () => {
    const random = getUuid();
    configTab.configInput.clear();
    configTab.configInput.type('<!-- ' + random + '--');
});

Given(`user sees the actual date in the revisions list`, () => {
    configTab.getActualDateRevision();
});

Given(/user checks that the actual date (not |)change/, (value: string) => {
    customWait(1);
    configTab.revisionsSelector.checkNotContain('Select revision');
    if (value === 'not ') {
        configTab.checkNotDateChange(true);
    } else {
        configTab.checkNotDateChange(false);
    }
});

Given(`user sees the "Server config" and the "Edited config" configs`, () => {
    configTab.configList.contains('Server config');
    configTab.configList.contains('Edited config');
    cy.get('@configValue').then((object) => {
        const config = object as unknown as string;
        configTab.configDiffText.checkContain(config);
        configTab.configOriginalText.checkNotContain(config);
    });
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

Given(`user selects the {string} revision from the list revisions`, (nameRevision: string) => {
    configTab.checkNotExistLoadingRevisionList();
    customWait(1);
    // configTab.revisionsInput.click();
    configTab.revisionsInput
        .get()
        // .invoke('attr', 'contenteditable', 'true')
        .type(nameRevision, { force: true, delay: 0 });
    configTab.revisionsList.containsClick(nameRevision);
    configTab.configList.contains(nameRevision);
});

Given(`user selects the previous date from the list revisions`, () => {
    configTab.revisionsSelector.click();
    configTab.selectPreviousRevision();
});

Given(`user sees the {string} selected revision version`, (nameRevision: string) => {
    configTab.revisionsSelector.click();
    configTab.loadingRevisions.checkNotExists();
    configTab.activeRevisions.checkContain(nameRevision);
    configTab.configList.contains(nameRevision);
    configTab.checkElementsEnable();
});

Given(/user (sees|not sees) the "configDigest" parameter in the URL/, (value: string) => {
    switch (value) {
        case 'not sees':
            checkNotUrlInclude('configDigest=');
            break;
        case 'sees':
            checkUrlInclude('configDigest=');
            break;
    }
});

Given(`clicks on the draft button`, () => {
    configTab.diffButton.click();
    cy.get('@configValue').then((object) => {
        const config = object as unknown as string;
        configTab.configDiffText.checkContain(config);
        configTab.configOriginalText.checkNotContain(config);
    });
    configTab.diffButton.click();
});

Given(`user sees today's date in the revisions list`, () => {
    configTab.revisionsSelector.click();
    configTab.activeRevisions.checkVisible();
    configTab.activeRevisions.checkContain(dateChange(ETime.Now));
});

Given(`user selects the last revision`, () => {
    configTab.revisionsSelector.click();
    customWait(1);
    configTab.revisionsListItem.firstClick();
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

Given(`user clicks a Apply button`, () => {
    configTab.applyButton.checkEnabled();
    configTab.applyButton.click();
});
