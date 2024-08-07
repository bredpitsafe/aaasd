import { Given } from '@badeball/cypress-cucumber-preprocessor';

import { positionsTableRow } from '../../../../../../lib/page-objects/trading-servers-manager/components/positions/positions.table.row';
import { customWait } from '../../../../../../lib/web-socket/server';

Given(
    `user types {string} in the override {string} filter in the "Positions" tab`,
    (value: string, nameFilter) => {
        switch (nameFilter) {
            case 'Instrument':
                positionsTableRow.filterRow.get().eq(0).type(value);
                break;
            case 'VA':
                positionsTableRow.filterRow.get().eq(1).type(value);
                break;
            case 'Robot Name':
                positionsTableRow.filterRow.get().eq(2).type(value);
                break;
        }
        customWait(1);
    },
);

Given(
    `user types {string} in the override {string} filter in the "Robot Positions" tab`,
    (value: string, nameFilter) => {
        switch (nameFilter) {
            case 'Instrument':
                positionsTableRow.filterRow.get().eq(0).type(value);
                break;
            case 'VA':
                positionsTableRow.filterRow.get().eq(1).type(value);
                break;
        }
        customWait(1);
    },
);

Given(`user clicks the {string} robotID in the table`, (value: string) => {
    positionsTableRow.robotIDRowText.containsClick(value);
});
