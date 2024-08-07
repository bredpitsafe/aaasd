import { EConfigsTabTabSelectors } from '@frontend/common/e2e/selectors/backtesting/components/configs-tab/configs.tab.selectors';

import { Text } from '../../../../base/elements/text';
import { TDataTask } from '../../../../interfaces/backtesting/dataTack';

class ConfigsTab {
    readonly runConfigTab = new Text(EConfigsTabTabSelectors.ConfigsTab, false);

    checkVisibleTab(): void {
        this.runConfigTab.checkContain('IndicatorRobot');
    }

    checkRobotConfigByIndex(data: TDataTask, index: number): void {
        this.runConfigTab.checkContain(data.instruments[index]);
    }
}

export const configsTab = new ConfigsTab();
