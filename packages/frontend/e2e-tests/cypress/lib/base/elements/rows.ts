import { UIElement } from '../ui-element';

export class Rows extends UIElement {
    checkAllRowsWithLocatorContainText(locator: string, text: string): void {
        this.get()
            .should('be.visible')
            .then(() => {
                cy.get(locator).each(($elem) => {
                    cy.wrap($elem).should('contain', text);
                });
            });
    }

    checkAllRowsWithLocatorContainTextCaseInsensitive(locator: string, text: string): void {
        this.get()
            .should('be.visible')
            .then(() => {
                cy.get(locator).each(($elem) => {
                    cy.wrap($elem)
                        .invoke('text')
                        .then((elementText) => {
                            expect(elementText.toLowerCase()).to.include(text.toLowerCase());
                        });
                });
            });
    }

    checkAllRowsWithLocatorNotContainText(locator: string, text: string): void {
        this.get()
            .should('be.visible')
            .then(() => {
                cy.get(locator).each(($elem) => {
                    cy.wrap($elem).should('not.contain', text);
                });
            });
    }
}
