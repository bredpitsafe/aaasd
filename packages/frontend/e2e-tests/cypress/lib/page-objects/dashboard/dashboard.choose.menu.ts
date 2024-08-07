import { EDashboardChooseMenuSelectors } from '@frontend/common/e2e/selectors/dashboard/dashboard.choose.menu.selectors';

import { Button } from '../../base/elements/button';
import { Input } from '../../base/elements/input';
import { Text } from '../../base/elements/text';
import { ETableHeaderSelectors } from '../common/table/table.header';
import { TableRow } from '../common/table/table.row';

class DashboardChooseMenu extends TableRow {
    readonly dashboardChooseMenuList = new Text(
        EDashboardChooseMenuSelectors.DashboardChooseMenuList,
    );
    readonly addDashboardButton = new Text(EDashboardChooseMenuSelectors.AddDashboardButton);
    readonly closeDashboardChooseMenuButton = new Button(
        EDashboardChooseMenuSelectors.CloseDashboardChooseMenuButton,
        false,
    );
    readonly dashboardContextMenu = new Button(
        EDashboardChooseMenuSelectors.DashboardContextMenu,
        false,
    );
    readonly dashboardNameInput = new Input(
        EDashboardChooseMenuSelectors.DashboardNameInput,
        false,
    );

    checkVisibleMenu() {
        this.dashboardChooseMenuList.checkVisible();
        this.addDashboardButton.checkVisible();
    }

    checkNotVisibleMenu() {
        this.dashboardChooseMenuList.checkNotVisible();
        this.addDashboardButton.checkNotExists();
    }

    selectContextItemByName(nameDashboard: string, nameItem: string) {
        cy.get(ETableHeaderSelectors.TableBody).contains(nameDashboard).rightclick();
        this.dashboardContextMenu.containsClick(nameItem);
    }

    deleteAllDashboardByName(name: string) {
        const row = ETableHeaderSelectors.TableRowText;
        cy.get(ETableHeaderSelectors.TableBody)
            .should('be.visible')
            .then(($tableBody) => {
                const rows = $tableBody.find(row);
                if (rows.length > 0) {
                    cy.wrap(rows).each(($row) => {
                        const rowText = $row.text();
                        if (rowText.includes(name)) {
                            cy.wrap($row).rightclick();
                            this.dashboardContextMenu.containsClick('Delete Dashboard');
                        }
                    });
                } else {
                    this.dashboardChooseMenuList.checkNotContain(name);
                }
            });
    }
}

export const dashboardChooseMenu = new DashboardChooseMenu();
