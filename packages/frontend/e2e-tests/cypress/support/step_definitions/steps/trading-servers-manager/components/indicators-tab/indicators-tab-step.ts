import { Given } from '@badeball/cypress-cucumber-preprocessor';

import { tableFilter } from '../../../../../../lib/page-objects/common/table/table.filter';
import { tableHeader } from '../../../../../../lib/page-objects/common/table/table.header';
import { tableRow } from '../../../../../../lib/page-objects/common/table/table.row';
import { ETime } from '../../../../../../lib/page-objects/common/time';
import { indicatorsTab } from '../../../../../../lib/page-objects/trading-servers-manager/components/indicators-tab/indicators.tab';
import { indicatorsTableRow } from '../../../../../../lib/page-objects/trading-servers-manager/components/indicators-tab/indicators.table.row';
import { customWait } from '../../../../../../lib/web-socket/server';
import { dateChange } from '../../../../../data/date';

Given(`user clicks on the "Case Sensitive" switch button in the {string} tab`, () => {
    tableFilter.switchButton.checkVisible();
    tableFilter.switchButton.click();
    customWait(1);
});

Given(`user clicks on the {string} time button in the "Indicators" tab`, (time: string) => {
    indicatorsTab.checkElementsExists();
    tableHeader.checkVisibleRowsTable();
    indicatorsTab.updateTimeButton.click();
    indicatorsTab.updateTimeButton.containsClick(time);
    tableHeader.checkVisibleRowsTable();
});

Given(`user sees actual {string} date`, (time: ETime) => {
    customWait(1);
    tableRow.checkRowsContainDataText(dateChange(time));
});

Given(`user sets "Update Time" in the "Data" input`, () => {
    indicatorsTableRow.getActualUpdateTime();

    cy.get('@updateTime').then((object) => {
        const updateTime = object as unknown as string;
        tableFilter.dataInput.clearTypeTextAndEnter(updateTime);
        tableHeader.checkVisibleRowsTable();
        customWait(1);
    });
});

Given(`user sees a new "Update Time" in the table`, () => {
    indicatorsTableRow.getNewActualUpdateTime();

    cy.get('@updateTime').then((object) => {
        const updateTime = object as unknown as string;
        cy.get('@updateNewTime').then((object) => {
            const updateNewTime = object as unknown as string;
            expect(updateTime !== updateNewTime).to.be.true;
        });
    });
});

Given(`user sees the "Update Time" less the "Data" in the input field`, () => {
    cy.get('@updateTime').then((object) => {
        const updateTime = object as unknown as string;
        cy.get('@updateNewTime').then((object) => {
            const updateNewTime = object as unknown as string;
            expect(updateTime > updateNewTime).to.be.equal(true);
        });
    });
});
