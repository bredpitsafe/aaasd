import { Button } from '../button';
import { Text } from '../text';

export class TableHeader {
    private readonly container: string;
    readonly tableArrowButton: Button;
    readonly tableName: Text;
    readonly newComponentButton: Button;

    constructor(container: string) {
        this.container = container;
        this.tableArrowButton = new Button(`${this.container} .ant-collapse-expand-icon`, false);
        this.tableName = new Text(`${this.container} .ant-collapse-header-text`, false);
        this.newComponentButton = new Button(`${this.container} .ant-collapse-extra button`, false);
    }
}
