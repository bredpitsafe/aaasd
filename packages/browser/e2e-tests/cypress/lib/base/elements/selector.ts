import { UIElement } from '../ui-element';

export class Selector extends UIElement {
    selectByText(text: string): void {
        this.get().click();
        this.get().contains(text).click({ force: true });
    }
}
