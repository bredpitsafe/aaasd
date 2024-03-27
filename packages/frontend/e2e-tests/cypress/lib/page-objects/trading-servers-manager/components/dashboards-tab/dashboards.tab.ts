import { Text } from '../../../../base/elements/text';

export enum EDashboardsTabSelectors {
    DashboardsTable = '[class="ag-center-cols-viewport"]',
}
class DashboardsTab {
    readonly dashboardsTable = new Text(EDashboardsTabSelectors.DashboardsTable, false);

    checkElementsExists(): void {
        this.dashboardsTable.checkExists();
    }

    checkVisiblyRow(): void {
        const selectors = EDashboardsTabSelectors.DashboardsTable;
        const values = ['T', 'HerodotusMulti'];
        values.forEach((value) => {
            cy.contains(selectors, value);
        });
    }
}

export const dashboardsTab = new DashboardsTab();
