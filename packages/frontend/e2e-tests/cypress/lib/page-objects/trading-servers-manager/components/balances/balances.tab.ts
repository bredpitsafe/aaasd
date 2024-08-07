import { ETableTabFilterSelectors } from '@frontend/common/e2e/selectors/table-tab.filter.selectors';
import { EBalancesTabSelectors } from '@frontend/common/e2e/selectors/trading-servers-manager/components/balances/balances.tab.selectors';

import { Input } from '../../../../base/elements/input';
import { ETableHeaderSelectors } from '../../../common/table/table.header';

const balancesColumns = [
    'Instrument ID',
    'Instrument',
    'VA ID',
    'VA',
    'Robot ID',
    'Robot Name',
    'Asset ID',
    'Asset',
    'Balance',
    'Updated',
];

const robotBalancesColumns = [
    'Instrument ID',
    'Instrument',
    'VA ID',
    'VA',
    'Asset ID',
    'Asset',
    'Balance',
    'Updated',
];
class BalancesTab {
    readonly instrumentsFilter = new Input(EBalancesTabSelectors.InstrumentsFilter);
    readonly virtualAccountsFilter = new Input(EBalancesTabSelectors.VirtualAccountsFilter);
    readonly robotFilter = new Input(EBalancesTabSelectors.RobotFilter);
    readonly assetsFilter = new Input(EBalancesTabSelectors.AssetsFilter);
    readonly nonZeroBalancesOnlySwitch = new Input(ETableTabFilterSelectors.SwitchButton);

    checkElementsExists() {
        this.instrumentsFilter.checkExists();
        this.virtualAccountsFilter.checkExists();
        this.robotFilter.checkExists();
        this.assetsFilter.checkExists();
        this.nonZeroBalancesOnlySwitch.checkExists();
    }

    checkRobotElementsExists() {
        this.instrumentsFilter.checkExists();
        this.virtualAccountsFilter.checkExists();
        this.assetsFilter.checkExists();
        this.nonZeroBalancesOnlySwitch.checkExists();
    }

    checkVisibleTable(): void {
        const selector = ETableHeaderSelectors.TableHeaderText;
        for (const value of balancesColumns) {
            cy.contains(selector, value);
        }
    }

    checkVisibleRobotTable(): void {
        const selector = ETableHeaderSelectors.TableHeaderText;
        for (const value of robotBalancesColumns) {
            cy.contains(selector, value);
        }
    }

    selectsFilter(nameFilter: string, value: string) {
        switch (nameFilter) {
            case 'Instrument filter':
                balancesTab.instrumentsFilter.click();
                balancesTab.instrumentsFilter.type(value);
                balancesTab.instrumentsFilter.selectsByText(value);
                break;
            case 'Virtual Accounts filter':
                balancesTab.virtualAccountsFilter.click();
                balancesTab.virtualAccountsFilter.type(value);
                balancesTab.virtualAccountsFilter.selectsByText(value);
                break;
            case 'Robots filter':
                balancesTab.robotFilter.click();
                balancesTab.robotFilter.type(value);
                balancesTab.robotFilter.selectsByText(value);
                break;
            case 'Assets filter':
                balancesTab.assetsFilter.click();
                balancesTab.assetsFilter.type(value);
                balancesTab.assetsFilter.selectsByText(value);
                break;
        }
    }
}

export const balancesTab = new BalancesTab();
