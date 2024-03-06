import { Given } from '@badeball/cypress-cucumber-preprocessor';

import { THerodotusTradesData } from '../../../../lib/interfaces/herodotus-trades/herodotusTradesData';
import { herodotusTradesPage } from '../../../../lib/page-objects/herodotus-trades/herodotus-trades.page';
import { herodotusTradesTableRow } from '../../../../lib/page-objects/herodotus-trades/herodotus-trades.table.row';
import { getDataTradesT0071 } from '../../../data/herodotus-terminal/getDataTradesT0071';
import { getDataTradesT0525 } from '../../../data/herodotus-terminal/getDataTradesT0525';
import { getDataHerodotusTrades } from '../../../data/herodotus-trades/getDataHerodotusTrades';

Given(`user goes to the "Herodotus Trades" page`, () => {
    herodotusTradesPage.openPage();
    herodotusTradesPage.checkElementsExists();
});

Given(`user goes to the "Herodotus Trades" page of robot "Herodotus"`, () => {
    herodotusTradesPage.openPageForData();
});

Given(`user sees value in the table on the "Herodotus Trades" page`, () => {
    const data = getDataHerodotusTrades();
    herodotusTradesTableRow.checkDataInTable(data);
});

Given(`user sees the task value in the table with id {string}`, (numberTask: string) => {
    let data: THerodotusTradesData;
    switch (numberTask) {
        case '71':
            data = getDataTradesT0071();
            break;
        case '525':
            data = getDataTradesT0525();
            break;
    }
    herodotusTradesTableRow.checkDataInTable(data);
});
