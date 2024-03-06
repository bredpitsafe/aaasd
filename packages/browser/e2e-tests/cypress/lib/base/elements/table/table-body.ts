import { Row } from './row';

export class TableBody {
    private readonly container: string;

    constructor(container: string) {
        this.container = container;
    }

    getComponentByIndex(index: number): Row {
        return new Row(`${this.container} tr:nth-child(${index + 2})`);
    }

    getComponentByNameAndClick(name: string): void {
        cy.get(`${this.container} [col-id="name"]`).contains(name).click();
    }

    getComponentByNameAndRightClick(name: string): void {
        cy.get(`${this.container} [col-id="name"]`).contains(name).rightclick({ force: true });
    }
}
