import { Button } from '../button';
export class Row {
    private readonly container: string;
    readonly status: Button;
    readonly type: Button;
    readonly name: Button;

    constructor(container: string) {
        this.container = container;
        this.status = new Button(`${this.container} [class=ant-table-cell]:nth-child(2)`, false);
        this.type = new Button(`${this.container} [class=ant-table-cell]:nth-child(3)`, false);
        this.name = new Button(`${this.container} [class=ant-table-cell]:nth-child(4)`, false);
    }
}
