import { SettingsSwitch } from '@frontend/common/src/components/Settings/Switch';
import { memo } from 'react';

import { useConfirmProdSettings } from './hooks/useConfirmProdSettings';

export const ConfirmProdSettings = memo(() => {
    const [confirmProdSettings, onChangeConfirmProdSettings, , loading] = useConfirmProdSettings();

    return (
        <SettingsSwitch
            label="Confirm component actions for production environments"
            checked={confirmProdSettings}
            onChange={onChangeConfirmProdSettings}
            loading={loading}
        />
    );
});
