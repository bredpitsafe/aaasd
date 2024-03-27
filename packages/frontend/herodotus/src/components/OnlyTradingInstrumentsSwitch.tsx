import { Switch } from '@frontend/common/src/components/Switch.tsx';

import { useOnlyTradingInstruments } from '../hooks/useOnlyTradingInstruments.ts';

export const OnlyTradingInstrumentsSwitch = () => {
    const [onlyTradingInstruments, onChangeOnlyTradingInstruments] = useOnlyTradingInstruments();
    return (
        <Switch
            title="Select only Trading or All instrument statuses"
            size="small"
            checked={onlyTradingInstruments}
            checkedChildren="Trading"
            unCheckedChildren="All"
            onChange={onChangeOnlyTradingInstruments}
        />
    );
};
