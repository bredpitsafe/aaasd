import { testSelector } from '@frontend/common/e2e';
import { EPumpAndDumpTabSelectors } from '@frontend/common/e2e/selectors/balance-monitor/components/pump-and-dump/pump-and-dump.tab.selectors';

import { Text } from '../../../../base/elements/text';
import { TableContextMenu } from '../../../common/table/table.context-menu';

const tableTaskNameColumns = ['Coin', 'Time Interval', 'Rate Change'];

class PumpAndDampTab extends TableContextMenu {
    readonly pumpAndDumpTab = new Text(EPumpAndDumpTabSelectors.PumpAndDumpTab);
    readonly pumpAndDumpTabFilter = new Text(EPumpAndDumpTabSelectors.PumpAndDumpTabFilter);

    checkVisibleTable(): void {
        const selector = testSelector(EPumpAndDumpTabSelectors.PumpAndDumpTab);
        for (const value of tableTaskNameColumns) {
            cy.contains(selector, value);
        }
    }

    checkContainAllCoins() {
        cy.get(EPumpAndDumpTabSelectors.PumpAndDumpTabFilter).eq(0).click();
        this.headerMenu.contains('BBB');
        this.headerMenu.contains('AAA');
    }

    checkContainAllTimeInterval() {
        cy.get(EPumpAndDumpTabSelectors.PumpAndDumpTabFilter).eq(2).click();
        this.headerMenu.contains('1m');
        this.headerMenu.contains('1s');
    }
}

export const pumpAndDampTab = new PumpAndDampTab();
