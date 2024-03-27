import { customWait } from '../../web-socket/server';
import { UIElement } from '../ui-element';

export class Input extends UIElement {
    clickAndType(value: string, delay?: number): void {
        this.get().click({ force: true });
        this.get().type(value, { force: true, delay: delay }).type('{enter}');
    }

    clickClearAndType(value: string, delay?: number): void {
        this.get().click();
        this.get().should('be.enabled');
        this.get().should('not.be.disabled');
        this.get().clear();
        this.get().type(value, { delay: delay });
    }

    typeFirst(value: string, delay?: number): void {
        this.get().should('be.enabled');
        this.get().should('not.be.disabled');
        this.get().first().type(value, { delay: delay });
    }

    typeLast(value: string, delay?: number): void {
        this.get().should('be.enabled');
        this.get().should('not.be.disabled');
        this.get().last().type(value, { delay: delay });
    }

    type(value: string, delay?: number): void {
        this.get().should('be.enabled');
        this.get().should('not.be.disabled');
        this.get().type(value, { delay: delay });
    }

    typeAndEnter(value: string, delay?: number): void {
        this.get().should('be.enabled');
        this.get().should('be.visible');
        this.get().last().clear().type(value, { delay: delay });
        customWait(2);
        this.get().last().type('{enter}');
    }

    clearAndType(value: string, delay?: number): void {
        this.get().should('be.enabled');
        this.get().should('not.be.disabled');
        this.get().clear();
        this.get().type(value, { delay: delay });
    }

    clear(): void {
        this.get().should('be.enabled');
        this.get().should('be.visible');
        this.get().click({ force: true });
        this.get().focused().type('{selectall}');
        this.get().focused().clear({ force: true });
    }
}
