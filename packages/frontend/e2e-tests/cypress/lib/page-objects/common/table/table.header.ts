import { Rows } from '../../../base/elements/rows';
import { Text } from '../../../base/elements/text';
import { TableFilter } from './table.filter';

export const NoRowsToShow = 'No Rows To Show';
export enum ETableHeaderSelectors {
    TableText = '[class*=ag-root-wrapper-body]',
    TableBody = '[class*=ag-body-viewport]',
    TableHeaderText = '[class=ag-header-cell-text]',
    TableRowText = '[class*="ag-row ag-row"]',
    LoadingRowText = '[class="ag-overlay-loading-center"]',
    LoadingAppText = '[class*="LoadingOverlay"]',
    LoadingImg = '[aria-label="loading"]',
    OverlayLoading = '[class="ag-overlay-panel"]',
}
export class TableHeader extends TableFilter {
    readonly tableText = new Rows(ETableHeaderSelectors.TableText, false);
    readonly tableBody = new Rows(ETableHeaderSelectors.TableBody, false);
    readonly tableHeaderText = new Text(ETableHeaderSelectors.TableHeaderText, false);
    readonly tableRowText = new Text(ETableHeaderSelectors.TableRowText, false);
    readonly loadingAppText = new Text(ETableHeaderSelectors.LoadingAppText, false);
    readonly loadingRowText = new Text(ETableHeaderSelectors.LoadingRowText, false);
    readonly loadingImg = new Text(ETableHeaderSelectors.LoadingImg, false);
    readonly overlayLoading = new Text(ETableHeaderSelectors.OverlayLoading, false);

    clickHeaderByName(name: string): void {
        this.tableHeaderText.get().contains(name).click();
    }

    rightClickHeaderByName(name: string): void {
        this.tableHeaderText.get().last().contains(name).rightclick();
    }

    checkVisibleRowsTable(): void {
        this.tableBody.checkNotContain(NoRowsToShow);
        this.loadingRowText.checkNotExists(30000);
    }

    checkNotVisibleLoading(): void {
        this.loadingAppText.checkNotExists(30000);
        this.loadingRowText.checkNotExists(30000);
    }

    checkNotVisibleLoad(): void {
        cy.get(ETableHeaderSelectors.OverlayLoading)
            .last()
            .contains('Loading...', { timeout: 30000 })
            .should('not.exist');
    }
}

export const tableHeader = new TableHeader();
