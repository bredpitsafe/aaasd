import { testSelector } from '@frontend/common/e2e';

import { TableBody } from './table-body';
import { TableHeader } from './table-header';

export class Table {
    private readonly container: string;
    readonly tableHeader: TableHeader;
    readonly tableBody: TableBody;

    constructor(container: string, isTestSelector = true) {
        this.container = isTestSelector ? testSelector(container) : container;
        this.tableHeader = new TableHeader(this.container);
        this.tableBody = new TableBody(this.container);
    }
}
