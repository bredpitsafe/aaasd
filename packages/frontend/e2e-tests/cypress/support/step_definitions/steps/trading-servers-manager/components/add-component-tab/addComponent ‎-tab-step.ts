import { Given } from '@badeball/cypress-cucumber-preprocessor';

import { addComponentTab } from '../../../../../../lib/page-objects/trading-servers-manager/components/add-component-tab/add-component.tab';
import { tablesModal } from '../../../../../../lib/page-objects/trading-servers-manager/tables.modal';
import { getUuid } from '../../../../../data/random';

Given(`user clicks on the "Add Component" button in the {string} table`, (tableName: string) => {
    tablesModal.clickAddComponent(tableName);
});

Given(`user sees the {string} type in the types selector`, (typeComponent: string) => {
    addComponentTab.checkComponentSelect(typeComponent);
});

Given(`user clears the {string} input in the "Add Component" tab`, (nameInput: string) => {
    switch (nameInput) {
        case 'Name':
            addComponentTab.nameInput.clear();
            addComponentTab.kindInput.click();
            break;
        case 'Kind':
            addComponentTab.kindInput.clear();
            addComponentTab.nameInput.click();
            break;
    }
});

Given(`user sees the {string} type in the "Add Component" tab`, (errorMessage: string) => {
    addComponentTab.addComponentTab.contains(errorMessage);
});

Given(`user sees "Kind Selector" in the "Add Component" tab`, () => {
    addComponentTab.kindSelector.checkVisible();
    addComponentTab.kindInput.checkNotExists();
});

Given(`user sees "Kind Input" in the "Add Component" tab`, () => {
    addComponentTab.kindInput.checkVisible();
    addComponentTab.kindSelector.checkNotExists();
});

Given(`user sees "new Component" in the {string} table`, (nameTable: string) => {
    cy.get('@nameComponent').then((object) => {
        const nameComponent = object as unknown as string;
        tablesModal.checkAddComponent(nameTable, nameComponent);
    });
});

Given(`user types random value in the "Name" input`, () => {
    const random = getUuid();
    addComponentTab.nameInput.checkVisible();
    addComponentTab.nameInput.type('Component' + random);
    cy.wrap('Component' + random).as('nameComponent');
});

Given(`user selects the {string} in the "Kind" selector`, (nameComponent: string) => {
    addComponentTab.kindSelector.typeAndClickByText(nameComponent);
});

Given(`user types the {string} in the "Kind" selector`, (nameComponent: string) => {
    addComponentTab.kindInput.type(nameComponent);
});

Given(`user deletes created component`, () => {
    addComponentTab.deletedCreatedComponent();
});

Given(`user types the config of a new {string} component`, (kindComponent: string) => {
    switch (kindComponent) {
        case 'Exec Gates':
            addComponentTab.setConfig('cypress/fixtures/add-component/execGateBinanceSwap.xml');
            break;
        case 'MD Gates':
            addComponentTab.setConfig('cypress/fixtures/add-component/mdGateBinanceSwap.xml');
            break;
        case 'Robots':
            addComponentTab.setConfig('cypress/fixtures/add-component/md_subscriber.xml');
            break;
    }
    addComponentTab.createButton.checkEnabled();
});
