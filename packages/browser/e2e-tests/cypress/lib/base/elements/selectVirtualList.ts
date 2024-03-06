import { UIElement } from '../ui-element';

export class SelectVirtualList extends UIElement {
    selectByText(text: string, timeout = 3000): void {
        cy.get(`${this.selector} input`).last().type(text, { force: true });
        cy.get('[class=rc-virtual-list]', { timeout })
            .should('be.visible')
            .find(`[title="${text}"]`)
            .last()
            .should('be.visible')
            .click({ force: true });
    }

    clickByText(text: string): void {
        this.get().last().click();
        cy.get('[class=rc-virtual-list]')
            .last()
            .should('be.visible')
            .find(`[title="${text}"]`)
            .should('be.visible')
            .click({ force: true });
    }

    typeAndClickByText(text: string): void {
        this.get().last().click({ force: true }).type(text);
        cy.get('[class=rc-virtual-list]').last().contains(text).click();
    }

    typeAndClickByTextFirst(text: string): void {
        this.get().first().click().type(text);
        cy.get('[class=rc-virtual-list]').last().contains(text).click();
    }

    clickAndType(text: string): void {
        this.get().last().click();
        this.get().last().type(text, { delay: 0 }).type('{enter}');
    }

    clickAndTypeFirst(text: string): void {
        this.get().first().click();
        this.get().first().type(text, { delay: 0 }).type('{enter}');
    }

    clear(): void {
        this.get().focused().clear();
    }
}
