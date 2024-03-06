import { EIndicatorsTabSelectors } from '@frontend/common/e2e/selectors/trading-servers-manager/components/indicators-tab/indicators.tab.selectors';

import { Selector } from '../../../../base/elements/selector';
import { Text } from '../../../../base/elements/text';
import { TableFilter } from '../../../common/table/table.filter';
import { ETableHeaderSelectors } from '../../../common/table/table.header';

class IndicatorsTab extends TableFilter {
    readonly indicatorsTab = new Selector(EIndicatorsTabSelectors.IndicatorsTab);
    readonly updateTimeButton = new Selector(EIndicatorsTabSelectors.UpdateTimeButton);
    readonly itemsCountText = new Text(EIndicatorsTabSelectors.ItemsCountText);
    readonly lastUpdateText = new Text(EIndicatorsTabSelectors.LastUpdateText);

    checkVisibleTable(): void {
        const text = ETableHeaderSelectors.TableHeaderText;
        for (const value of ['Publisher', 'Name', 'Value', 'Update Time']) {
            cy.contains(text, value);
        }
    }
}

export const indicatorsTab = new IndicatorsTab();
