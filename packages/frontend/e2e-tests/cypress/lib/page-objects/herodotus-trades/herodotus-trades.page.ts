import { EHerodotusTradesSelectors } from '@frontend/common/e2e/selectors/herodotus-trades/herodotus-trades.page.selectors';

import { getDataHerodotusTrades } from '../../../support/data/herodotus-trades/getDataHerodotusTrades';
import { BasePage } from '../../base.page';
import { Text } from '../../base/elements/text';
import { EPagesUrl } from '../../interfaces/url-interfaces';
import { ETableHeaderSelectors } from '../common/table/table.header';

const PAGE_URL = EPagesUrl.herodotusTrades;

class HerodotusTradesPage extends BasePage {
    readonly mainTitleText: Text;

    constructor() {
        super(PAGE_URL);
        this.mainTitleText = new Text(EHerodotusTradesSelectors.App);
    }

    checkElementsExists(): void {
        this.mainTitleText.checkExists();
    }

    openPage(): void {
        cy.visit(PAGE_URL);
    }

    openPageForData(): void {
        const data = getDataHerodotusTrades();
        cy.visit(`${PAGE_URL}${data.URL}`);
    }

    checkVisibleTable(): void {
        const table = ETableHeaderSelectors.TableHeaderText;
        for (const value of [
            'Platform time',
            'Exchange Time',
            'Instrument',
            'Market',
            'Base',
            'Quote',
            'Type',
            'Role',
            'Price',
            'Size',
            'Volume',
            'Fee',
            'Fee amount',
            'ID',
        ]) {
            cy.contains(table, value);
        }
    }
}

export const herodotusTradesPage = new HerodotusTradesPage();
