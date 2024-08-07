import { Given } from '@badeball/cypress-cucumber-preprocessor';

import { tableFilter } from '../../../../../../lib/page-objects/common/table/table.filter';
import { tableHeader } from '../../../../../../lib/page-objects/common/table/table.header';
import { dashboardsTableRow } from '../../../../../../lib/page-objects/trading-servers-manager/components/dashboards-tab/dashboards.table.row';
import { customWait } from '../../../../../../lib/web-socket/server';

Given(`user types the first "Dashboard" in the input field`, () => {
    dashboardsTableRow.getActualNameDashboard();

    cy.get('@dashboardName').then((object) => {
        const dashboardName = object as unknown as string;
        tableFilter.nameInput.clearTypeTextAndEnter(dashboardName);
        tableHeader.checkVisibleRowsTable();
        customWait(1);
    });
});

Given(`user sets "Update time" in the "Data" input`, () => {
    dashboardsTableRow.getActualTimeDashboard();

    cy.get('@dashboardTime').then((object) => {
        const dashboardTime = object as unknown as string;
        tableFilter.dataInput.clearTypeTextAndEnter(dashboardTime);
        tableHeader.checkVisibleRowsTable();
        customWait(1);
    });
});

Given(`user sees a new "Update time" in the table`, () => {
    dashboardsTableRow.getNewActualTimeDashboard();

    cy.get('@dashboardTime').then((object) => {
        const dashboardTime = object as unknown as string;
        cy.get('@dashboardNewTime').then((object) => {
            const dashboardNewTime = object as unknown as string;
            expect(dashboardTime !== dashboardNewTime).to.be.true;
        });
    });
});

Given(`user sees the "Update time" less the "Data" in the input field`, () => {
    cy.get('@dashboardTime').then((object) => {
        const dashboardTime = object as unknown as string;
        cy.get('@dashboardNewTime').then((object) => {
            const dashboardNewTime = object as unknown as string;
            expect(dashboardTime > dashboardNewTime).to.be.equal(true);
        });
    });
});
