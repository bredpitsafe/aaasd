import { testSelector } from '@frontend/common/e2e';
import { EDashboardsTabSelectors } from '@frontend/common/e2e/selectors/trading-servers-manager/components/dashboards-tab/dashboards.tab.selectors';

import { Text } from '../../../../base/elements/text';
import { ETableBodySelectors, TableRow } from '../../../common/table/table.row';
import { ETableRowSelectors } from '../../../common/table/table.row-selectors';

export enum ETableTabRowDashboardsSelectors {
    RobotNameRowText = `${ETableBodySelectors.TableBody} [col-id="robotName"]`,
}

export class DashboardsTableRow extends TableRow {
    readonly dashboardLinkText = new Text(EDashboardsTabSelectors.DashboardLink);
    readonly updateTimeRowText = new Text(ETableRowSelectors.PlatformTimeRowText, false);
    readonly dashboardRowText = new Text(ETableRowSelectors.NameRowText, false);
    readonly robotNameRowText = new Text(ETableTabRowDashboardsSelectors.RobotNameRowText, false);

    getActualNameDashboard() {
        cy.get(testSelector(EDashboardsTabSelectors.DashboardLink))
            .first()
            .invoke('text')
            .then((name) => {
                cy.wrap(name).as('dashboardName');
            });
    }

    getTimeDashboard(alias) {
        cy.get(ETableRowSelectors.PlatformTimeRowText)
            .first()
            .invoke('text')
            .then((name) => {
                cy.wrap(name).as(alias);
            });
    }

    getActualTimeDashboard() {
        this.getTimeDashboard('dashboardTime');
    }

    getNewActualTimeDashboard() {
        this.getTimeDashboard('dashboardNewTime');
    }
}

export const dashboardsTableRow = new DashboardsTableRow();
