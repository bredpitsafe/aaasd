import { UIElement } from '../ui-element';

export class Button extends UIElement {
    rightClick(): void {
        this.get().rightclick();
    }
}
