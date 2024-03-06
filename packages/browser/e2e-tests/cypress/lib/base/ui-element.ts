import { testSelector } from '@frontend/common/e2e';

export class UIElement {
    readonly selector: string;

    constructor(selector: string, isTestSelector = true) {
        this.selector = isTestSelector ? testSelector(selector) : selector;
    }

    get(): Cypress.Chainable<JQuery> {
        return cy.get(this.selector);
    }

    click(): void {
        this.get().click();
    }

    clickForce(): void {
        this.get().click({ force: true });
    }

    firstClick(): void {
        this.get().first().click();
    }

    lastClick(): void {
        this.get().last().click();
    }

    doubleClick(): void {
        this.get().dblclick();
    }

    containsClick(text: string): void {
        this.get().contains(text).click();
    }

    containsRightClick(text: string): void {
        this.get().contains(text).rightclick();
    }

    containsDoubleClick(text: string): void {
        this.get().contains(text).dblclick();
    }

    checkVisible(): Cypress.Chainable<JQuery> {
        return this.get().should('be.visible');
    }

    checkNotVisible(): Cypress.Chainable<JQuery> {
        return this.get().should('not.be.visible');
    }

    contains(text: string): void {
        this.get().contains(text);
    }

    firstContains(text: string): void {
        this.get().first().contains(text);
    }

    firstContainsClick(text: string): void {
        this.get().contains(text).first().click();
    }

    waitCheckContains(text: string, timeout: number): Cypress.Chainable<JQuery> {
        return this.get().should('contain', text, { timeout });
    }

    checkContain(text: string): Cypress.Chainable<JQuery> {
        return this.get().should('contain', text);
    }

    checkNotContain(text: string): Cypress.Chainable<JQuery> {
        return this.get().should('not.contain', text);
    }

    checkFirstContain(text: string): Cypress.Chainable<JQuery> {
        return this.get().first().should('contain', text);
    }

    checkHaveValue(value: string): Cypress.Chainable<JQuery> {
        return this.get().should('have.value', value);
    }

    checkNotHaveValue(value: string): Cypress.Chainable<JQuery> {
        return this.get().should('not.have.value', value);
    }

    checkHavePlaceholder(value: string): Cypress.Chainable<JQuery> {
        return this.get().should('have.attr', 'placeholder', value);
    }

    checkExists(): Cypress.Chainable<JQuery> {
        return this.get().should('exist');
    }

    checkNotExists(): Cypress.Chainable<JQuery> {
        return this.get().should('not.exist');
    }

    checkEnabled(): Cypress.Chainable<JQuery> {
        return this.get().should('be.enabled');
    }

    checkNotEnabled(): Cypress.Chainable<JQuery> {
        return this.get().should('not.be.enabled');
    }

    scrollAndCheckContains(text: string): Cypress.Chainable<JQuery> {
        this.get().first().scrollIntoView();
        return this.get().should('contain', text);
    }

    scrollByText(text: string): Cypress.Chainable<JQuery> {
        return this.get().should('contain', text).first().scrollIntoView();
    }

    scrollIntoView(): Cypress.Chainable<JQuery> {
        return this.get().scrollIntoView();
    }

    dblclickAndTypeText(text: string): void {
        this.get().first().dblclick().type(text).type('{enter}');
    }

    dblclickAndSelectByText(text: string): void {
        this.get().first().dblclick();
        cy.get('[class*=ag-virtual-list-viewport]').contains(text).click();
    }

    clickByIndexAndSelectByText(index: number, text: string): void {
        this.get().eq(index).click();
        cy.get('[class=rc-virtual-list]').last().contains(text).click();
    }

    selectsText(text: string): void {
        cy.get('[class=rc-virtual-list]').last().contains(text).click();
    }

    selectsItemByText(text: string): void {
        cy.get('[class*="ag-popup-editor"]').last().click();
        cy.get('[class*="ag-list ag-select-list"]').last().contains(text).click();
    }

    checkListContainText(text: string): void {
        cy.get('[class=rc-virtual-list]').last().contains(text);
    }

    checkListNotContainText(text: string): void {
        cy.get('[class=rc-virtual-list]').last().should('not.contain', text);
    }
}
