import { customWait } from '../../web-socket/server';
import { UIElement } from '../ui-element';

export class Input extends UIElement {
    typeFirst(value: string, delay?: number): void {
        this.get().should('not.be.disabled');
        this.get().first().type(value, { delay: delay });
    }

    type(value: string, delay?: number): void {
        this.get().should('not.be.disabled');
        this.get().last().type(value, { delay: delay });
    }

    clearTypeTextAndEnter(value: string, delay?: number): void {
        this.get().should('be.enabled');
        this.get().last().clear().type(value, { delay: delay });
        customWait(0.2);
        this.get().last().type('{enter}');
    }

    clearAndTypeText(value: string, delay?: number): void {
        this.get().should('be.enabled');
        this.get().clear();
        this.get().type(value, { delay: delay });
    }

    clickClearAndTypeText(value: string, delay?: number): void {
        this.get().click();
        this.get().should('be.enabled');
        this.get().clear();
        this.get().type(value, { delay: delay }).type('{enter}');
    }

    clear(): void {
        this.get().should('be.enabled');
        this.get().click({ force: true });
        this.get().type('{selectall}', { force: true });
        this.get().clear({ force: true });
    }
}
