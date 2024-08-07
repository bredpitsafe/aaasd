import { EIndicatorsTabSelectors } from '@frontend/common/e2e/selectors/trading-servers-manager/components/indicators-tab/indicators.tab.selectors';

import { Select } from '../../../../base/elements/select';
import { Text } from '../../../../base/elements/text';
import { TableFilter } from '../../../common/table/table.filter';
import { ETableHeaderSelectors } from '../../../common/table/table.header';

class IndicatorsTab extends TableFilter {
    readonly indicatorsTab = new Select(EIndicatorsTabSelectors.IndicatorsTab);
    readonly updateTimeButton = new Select(EIndicatorsTabSelectors.UpdateTimeButton);
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
