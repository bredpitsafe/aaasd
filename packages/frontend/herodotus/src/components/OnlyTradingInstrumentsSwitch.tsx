import { createTestProps } from '@frontend/common/e2e';
import { EAddTaskTabSelectors } from '@frontend/common/e2e/selectors/trading-servers-manager/components/add-task-tab/add-task.tab.selectors';
import { Switch } from '@frontend/common/src/components/Switch.tsx';

import { useOnlyTradingInstruments } from '../hooks/useOnlyTradingInstruments.ts';

export const OnlyTradingInstrumentsSwitch = () => {
    const [onlyTradingInstruments, onChangeOnlyTradingInstruments, , loading] =
        useOnlyTradingInstruments();
    return (
        <Switch
            {...createTestProps(EAddTaskTabSelectors.TradingSwitch)}
            title="Select only Trading or All instrument statuses"
            size="small"
            checked={onlyTradingInstruments}
            checkedChildren="Trading"
            unCheckedChildren="All"
            onChange={onChangeOnlyTradingInstruments}
            loading={loading}
        />
    );
};
