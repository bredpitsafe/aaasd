import { EIndicatorsTabSelectors } from '@frontend/common/e2e/selectors/trading-servers-manager/components/indicators-tab/indicators.tab.selectors';

import { Text } from '../../../../base/elements/text';
import { TableFilter } from '../../../common/table/table.filter';
import { ETableHeaderSelectors } from '../../../common/table/table.header';

class InstrumentsTab extends TableFilter {
    readonly itemsCountText = new Text(EIndicatorsTabSelectors.ItemsCountText);
    readonly lastUpdateText = new Text(EIndicatorsTabSelectors.LastUpdateText);

    checkVisibleTable(): void {
        const table = ETableHeaderSelectors.TableHeaderText;
        for (const value of [
            'ID',
            'Name',
            'Exchange',
            'Kind',
            'Status',
            'Min. Price',
            'Max. Price',
            'Min. Qty',
            'Max. Qty',
            'Min. Vol.',
            'Price Step',
            'Qty. Step',
            'Base',
            'Quote',
            'PNL Mult.',
        ]) {
            cy.contains(table, value);
        }
    }
}

export const instrumentsTab = new InstrumentsTab();
