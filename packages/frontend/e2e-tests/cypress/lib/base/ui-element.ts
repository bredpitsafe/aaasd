import { testSelector } from '@frontend/common/e2e';

import { customWait } from '../web-socket/server';

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

    clickFirst(): void {
        this.get().first().click();
    }

    clickLast(): void {
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

    checkContain(text: string, waitTime: number = 3000): Cypress.Chainable<JQuery> {
        return this.get().should('contain', text, { waitTime });
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

    checkHavePlaceholder(value: string): Cypress.Chainable<JQuery> {
        return this.get().should('have.attr', 'placeholder', value);
    }

    checkHaveCSS(cssValue: string, value: string): Cypress.Chainable<JQuery> {
        return this.get().should('have.css', cssValue, value);
    }

    checkExists(): Cypress.Chainable<JQuery> {
        return this.get().should('exist');
    }

    checkNotExists(waitTime?: number): Cypress.Chainable<JQuery> {
        if (waitTime) {
            return this.get().should('not.exist', { timeout: waitTime });
        } else {
            return this.get().should('not.exist');
        }
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

    scrollIntoView(): Cypress.Chainable<JQuery> {
        return this.get().scrollIntoView();
    }

    dblclickAndTypeText(text: string): void {
        this.get().first().dblclick().type(text).type('{enter}');
    }

    dblclickAndSelectByText(text: string): void {
        this.get().first().dblclick();
        customWait(0.2);
        cy.get('[class*=ag-virtual-list-viewport]').contains(text).click();
    }

    clickByIndexAndSelectByText(index: number, text: string): void {
        this.get().eq(index).click();
        cy.get('[class=rc-virtual-list]').last().contains(text).click();
    }

    selectsByText(text: string): void {
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

    checkVisibleListNoData(): void {
        cy.get('[class*="ant-select-dropdown"]').last().should('contain', 'No data');
    }

    clickTypeWaitTextAndEnter(text: string, waitTime: number = 3000): void {
        this.get().last().click();
        this.get().last().type(text, { delay: 0 });
        cy.get('[class=rc-virtual-list]').should('contain', text, { waitTime });
        customWait(0.2);
        this.get().last().type('{enter}');
    }

    clickTypeTextAndEnter(text: string): void {
        this.get().last().click().type(text, { delay: 0 });
        customWait(0.2);
        this.get().last().type('{enter}');
    }

    clickTypeTextAndEnterFirst(text: string): void {
        this.get().first().click().type(text, { delay: 0 });
        customWait(0.2);
        this.get().first().type('{enter}');
    }
}
