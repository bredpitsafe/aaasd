import { EDashboardCardModalSelectors } from '@frontend/common/e2e/selectors/dashboard/dashboard.card.modal.selectors';

import { Button } from '../../base/elements/button';
import { Text } from '../../base/elements/text';
import { ETableHeaderSelectors } from '../common/table/table.header';
import { TableRow } from '../common/table/table.row';

class DashboardCardModal extends TableRow {
    readonly dashboardCard = new Text(EDashboardCardModalSelectors.DashboardCard);
    readonly dashboardCardItem = new Text(EDashboardCardModalSelectors.DashboardCardItem);
    readonly dashboardCardItemText = new Text(EDashboardCardModalSelectors.DashboardCardItemText);
    readonly dashboardMenu = new Button(EDashboardCardModalSelectors.DashboardMenu, false);

    deleteDashboardByName(name: string) {
        cy.get(ETableHeaderSelectors.TableBody).contains(name).rightclick();
    }
}

export const dashboardCardModal = new DashboardCardModal();
