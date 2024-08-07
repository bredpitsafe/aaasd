import { ETableTabFilterSelectors } from '@frontend/common/e2e/selectors/table-tab.filter.selectors';
import { EPositionsTabSelectors } from '@frontend/common/e2e/selectors/trading-servers-manager/components/positions/positions.tab.selectors';

import { Button } from '../../../../base/elements/button';
import { ETableHeaderSelectors } from '../../../common/table/table.header';

const positionsColumns = [
    'Instrument ID',
    'Instrument',
    'VA ID',
    'VA',
    'Robot ID',
    'Robot Name',
    'Position, Contracts',
    'Updated',
];

const robotPositionColumns = [
    'Instrument ID',
    'Instrument',
    'VA ID',
    'VA',
    'Position, Contracts',
    'Updated',
];

class PositionsTab {
    readonly instrumentsFilter = new Button(EPositionsTabSelectors.InstrumentsFilter);
    readonly virtualAccountsFilter = new Button(EPositionsTabSelectors.VirtualAccountsFilter);
    readonly robotFilter = new Button(EPositionsTabSelectors.RobotFilter);
    readonly nonZeroBalancesOnlySwitch = new Button(ETableTabFilterSelectors.SwitchButton);

    checkElementsExists() {
        this.instrumentsFilter.checkExists();
        this.virtualAccountsFilter.checkExists();
        this.robotFilter.checkExists();
        this.nonZeroBalancesOnlySwitch.checkExists();
    }

    checkRobotElementsExists() {
        this.instrumentsFilter.checkExists();
        this.virtualAccountsFilter.checkExists();
        this.nonZeroBalancesOnlySwitch.checkExists();
    }

    checkVisibleTable(): void {
        const selector = ETableHeaderSelectors.TableHeaderText;
        for (const value of positionsColumns) {
            cy.contains(selector, value);
        }
    }

    checkVisibleRobotTable(): void {
        const selector = ETableHeaderSelectors.TableHeaderText;
        for (const value of robotPositionColumns) {
            cy.contains(selector, value);
        }
    }
}

export const positionsTab = new PositionsTab();
