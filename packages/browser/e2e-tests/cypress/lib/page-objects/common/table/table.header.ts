import { Rows } from '../../../base/elements/rows';
import { Text } from '../../../base/elements/text';
import { TableFilter } from './table.filter';

export enum ETableHeaderSelectors {
    TableText = '[class*=ag-root-wrapper-body]',
    TableBody = '[class*=ag-body-viewport]',
    TableHeaderText = '[class=ag-header-cell-text]',
    TableRowText = '[class*="ag-row ag-row"]',
    LoadingRowText = '[class="ag-overlay-loading-center"]',
    LoadingAppText = '[class*="LoadingOverlay"]',
    LoadingImg = '[aria-label="loading"]',
}
export class TableHeader extends TableFilter {
    readonly tableText = new Rows(ETableHeaderSelectors.TableText, false);
    readonly tableBody = new Rows(ETableHeaderSelectors.TableBody, false);
    readonly tableHeaderText = new Text(ETableHeaderSelectors.TableHeaderText, false);
    readonly tableRowText = new Text(ETableHeaderSelectors.TableRowText, false);
    readonly loadingAppText = new Text(ETableHeaderSelectors.LoadingAppText, false);
    readonly loadingRowText = new Text(ETableHeaderSelectors.LoadingRowText, false);
    readonly loadingImg = new Text(ETableHeaderSelectors.LoadingImg, false);

    constructor() {
        super();
    }

    clickHeaderByName(name: string): void {
        this.tableHeaderText.get().contains(name).click();
    }

    checkVisibleRowsTable(): void {
        cy.get(ETableHeaderSelectors.TableBody)
            .last()
            .within(() => this.loadingImg.checkNotExists());
        this.tableBody.checkNotContain('No Rows To Show');
        this.loadingRowText.checkNotExists();
    }

    checkNotVisibleLoading(): void {
        this.loadingAppText.checkNotExists();
        this.loadingImg.checkNotExists();
        this.loadingRowText.checkNotExists();
    }
}

export const tableHeader = new TableHeader();
